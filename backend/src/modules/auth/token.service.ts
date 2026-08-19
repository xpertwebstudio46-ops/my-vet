import { createHash, randomBytes } from 'node:crypto'
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import type { Role } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { durationToMilliseconds } from '../../shared/utils/duration.js'

interface AccessPayload extends JwtPayload {
  sub: string
  role: Role
}

export function signAccessToken(userId: string, role: Role) {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_ACCESS_EXPIRY as NonNullable<SignOptions['expiresIn']>,
  })
}

export function verifyAccessToken(token: string): AccessPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  })
  if (typeof payload === 'string' || !payload.sub || typeof payload.role !== 'string') {
    throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid')
  }
  if (!['PET_OWNER', 'VET', 'ADMIN'].includes(payload.role)) {
    throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token role is invalid')
  }
  return payload as AccessPayload
}

export function hashOpaqueToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function createRawRefreshToken(family = randomBytes(16).toString('hex')) {
  return { family, rawToken: `${family}.${randomBytes(48).toString('base64url')}` }
}

export function refreshTokenMaxAge() {
  return durationToMilliseconds(env.JWT_REFRESH_EXPIRY)
}

export async function issueRefreshToken(userId: string, family?: string) {
  const token = createRawRefreshToken(family)
  await prisma.refreshToken.create({
    data: {
      userId,
      family: token.family,
      hashedToken: hashOpaqueToken(token.rawToken),
      expiresAt: new Date(Date.now() + refreshTokenMaxAge()),
    },
  })
  return token.rawToken
}

type RotationResult =
  | { kind: 'rotated'; rawToken: string; user: { id: string; role: Role } }
  | { kind: 'reuse' }
  | { kind: 'invalid' }

export async function rotateRefreshToken(rawToken: string) {
  const hashedToken = hashOpaqueToken(rawToken)
  const result = await prisma.$transaction<RotationResult>(async (transaction) => {
    const stored = await transaction.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: { select: { id: true, role: true, deletedAt: true } } },
    })
    if (!stored) return { kind: 'invalid' }

    if (stored.usedAt || stored.revokedAt) {
      await transaction.refreshToken.updateMany({
        where: { family: stored.family, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      return { kind: 'reuse' }
    }

    if (stored.expiresAt <= new Date() || stored.user.deletedAt) return { kind: 'invalid' }

    const consumed = await transaction.refreshToken.updateMany({
      where: { id: stored.id, usedAt: null, revokedAt: null },
      data: { usedAt: new Date(), revokedAt: new Date() },
    })
    if (consumed.count !== 1) {
      await transaction.refreshToken.updateMany({
        where: { family: stored.family, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      return { kind: 'reuse' }
    }

    const next = createRawRefreshToken(stored.family)
    const replacement = await transaction.refreshToken.create({
      data: {
        userId: stored.userId,
        family: stored.family,
        hashedToken: hashOpaqueToken(next.rawToken),
        expiresAt: new Date(Date.now() + refreshTokenMaxAge()),
      },
    })
    await transaction.refreshToken.update({ where: { id: stored.id }, data: { replacedById: replacement.id } })
    return { kind: 'rotated', rawToken: next.rawToken, user: { id: stored.user.id, role: stored.user.role } }
  })

  if (result.kind === 'reuse') {
    throw new ApiError(401, 'TOKEN_REUSE_DETECTED', 'This session has been revoked')
  }
  if (result.kind === 'invalid') {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired')
  }
  return result
}

export async function revokeRefreshToken(rawToken: string) {
  await prisma.refreshToken.updateMany({
    where: { hashedToken: hashOpaqueToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
