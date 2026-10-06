import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { mailService } from '../../shared/services/mail.service.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import type { LoginInput, RegisterInput, ResetPasswordInput } from './auth.validation.js'
import { invalidateAuthUser } from './user-auth-cache.js'
import {
  hashOpaqueToken,
  issueRefreshToken,
  revokeAllUserSessions,
  rotateRefreshToken,
  signAccessToken,
} from './token.service.js'

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  avatar: true,
  approvalStatus: true,
  createdAt: true,
} as const

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12)
  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
        firstName: input.firstName,
        lastName: input.lastName,
        approvalStatus: input.role === 'PET_OWNER' ? 'PENDING' : 'APPROVED',
      },
      select: safeUserSelect,
    })
    if (user.role !== 'PET_OWNER' || user.approvalStatus !== 'PENDING') return { user, notifications: [] }
    const admins = await transaction.user.findMany({ where: { role: 'ADMIN', deletedAt: null }, select: { id: true } })
    const notifications = await Promise.all(admins.map((admin) => createNotification(transaction, {
      userId: admin.id,
      category: 'SYSTEM',
      title: 'Pet owner awaiting approval',
      message: `${user.firstName} ${user.lastName} has created a pet-owner account`,
      actionUrl: '/admin-dashboard/pet-owner',
      entityType: 'USER',
      entityId: user.id,
      statusSnapshot: 'PENDING',
    })))
    return { user, notifications }
  })
  emitNotifications(result.notifications)
  const { user } = result
  if (user.role === 'PET_OWNER' && user.approvalStatus !== 'APPROVED') {
    return { user, requiresApproval: true }
  }
  const refreshToken = await issueRefreshToken(user.id)
  return { user, accessToken: signAccessToken(user.id, user.role), refreshToken, requiresApproval: false }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false
  if (!user || !valid || user.deletedAt) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
  }
  if (user.role === 'PET_OWNER' && user.approvalStatus !== 'APPROVED') {
    throw new ApiError(403, 'ACCOUNT_AWAITING_APPROVAL', user.approvalStatus === 'REJECTED' ? 'Your account has not been approved.' : 'Your account is waiting for admin approval.')
  }
  const refreshToken = await issueRefreshToken(user.id)
  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    approvalStatus: user.approvalStatus,
    createdAt: user.createdAt,
  }
  return { user: safeUser, accessToken: signAccessToken(user.id, user.role), refreshToken }
}

export async function refresh(rawToken: string) {
  const rotated = await rotateRefreshToken(rawToken)
  return {
    refreshToken: rotated.rawToken,
    accessToken: signAccessToken(rotated.user.id, rotated.user.role),
  }
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null }, select: { id: true, email: true } })
  if (!user) return

  const rawToken = randomBytes(48).toString('base64url')
  const expiresAt = new Date(Date.now() + 30 * 60_000)
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, hashedToken: hashOpaqueToken(rawToken), expiresAt },
    }),
  ])
  const resetUrl = new URL(env.PASSWORD_RESET_URL)
  resetUrl.searchParams.set('token', rawToken)
  await mailService.send({
    to: user.email,
    subject: 'Reset your My Vet password',
    text: `Use this link within 30 minutes: ${resetUrl.toString()}`,
  })
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashOpaqueToken(input.token)
  const record = await prisma.passwordResetToken.findUnique({ where: { hashedToken: tokenHash } })
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new ApiError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or expired')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const consumedAt = new Date()
  const consumed = await prisma.$transaction(async (transaction) => {
    const update = await transaction.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: consumedAt } },
      data: { usedAt: consumedAt },
    })
    if (update.count !== 1) return false
    await transaction.user.update({ where: { id: record.userId }, data: { passwordHash } })
    await transaction.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: consumedAt },
    })
    return true
  })
  if (!consumed) throw new ApiError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or expired')
  invalidateAuthUser(record.userId)
}

export async function getMe(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: safeUserSelect })
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found')
  return user
}

export { revokeAllUserSessions }
