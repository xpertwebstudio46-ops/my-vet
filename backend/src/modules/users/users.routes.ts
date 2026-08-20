import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../auth/auth.middleware.js'
import { invalidateAuthUser } from '../auth/user-auth-cache.js'
import { validateBody } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { deleteUploadedAssetByUrl, markUploadAttached, requireUploadForAttachment } from '../upload/asset-attachment.service.js'

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  avatarAssetId: z.string().min(1).nullable().optional(),
  bio: z.string().trim().max(1_000).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  postcode: z.string().trim().max(20).nullable().optional(),
})

const preferencesSchema = z.object({
  language: z.string().trim().min(2).max(10).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(10).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
})

const safeProfileSelect = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  bio: true,
  address: true,
  city: true,
  postcode: true,
  language: true,
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: true,
  createdAt: true,
  updatedAt: true,
} as const

export const usersRouter = Router()
usersRouter.use(authenticate)

usersRouter.get('/me/profile', async (request, response) => {
  const user = await prisma.user.findFirst({
    where: { id: request.user!.userId, deletedAt: null },
    select: safeProfileSelect,
  })
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found')
  sendSuccess(response, user)
})

usersRouter.put('/me/profile', validateBody(profileSchema), async (request, response) => {
  const userId = request.user!.userId
  const body = request.validatedBody as z.infer<typeof profileSchema>
  const { avatarAssetId, ...profile } = body
  const previous = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } })
  if (!previous) throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found')
  const asset = avatarAssetId ? await requireUploadForAttachment(avatarAssetId, 'AVATAR', { ownerUserId: userId }) : null
  const user = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.user.update({
      where: { id: userId },
      data: { ...profile, ...(avatarAssetId !== undefined ? { avatar: asset?.url ?? null } : {}) },
      select: safeProfileSelect,
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return updated
  })
  if (avatarAssetId !== undefined && previous.avatar !== user.avatar) {
    await deleteUploadedAssetByUrl(previous.avatar, ['AVATAR'], { ownerUserId: userId }).catch(() => undefined)
  }
  sendSuccess(response, user, 'Profile updated')
})

usersRouter.put('/me/preferences', validateBody(preferencesSchema), async (request, response) => {
  const user = await prisma.user.update({
    where: { id: request.user!.userId },
    data: request.validatedBody as z.infer<typeof preferencesSchema>,
    select: {
      language: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: true,
    },
  })
  sendSuccess(response, user, 'Preferences updated')
})

usersRouter.put('/me/password', validateBody(passwordSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof passwordSchema>
  const userId = request.user!.userId
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  if (!user || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect')
  }
  const passwordHash = await bcrypt.hash(body.newPassword, 12)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ])
  invalidateAuthUser(userId)
  sendSuccess(response, { sessionsRevoked: true }, 'Password updated')
})

usersRouter.delete('/me', async (request, response) => {
  const userId = request.user!.userId
  const deletedAt = new Date()
  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({ where: { id: userId }, data: { deletedAt } })
    await transaction.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: deletedAt } })
    await transaction.practice.updateMany({
      where: { ownerId: userId, status: { not: 'ARCHIVED' } },
      data: { status: 'ARCHIVED', moderationReason: 'Owner account deleted' },
    })
  })
  invalidateAuthUser(userId)
  sendSuccess(response, { deleted: true }, 'Account deleted')
})
