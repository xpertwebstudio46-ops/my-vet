import type { Role } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'

interface CacheEntry {
  role: Role
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const ttl = 60_000

export async function getCurrentAuthUser(userId: string) {
  const cached = cache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.role === 'PET_OWNER' && cached.approvalStatus !== 'APPROVED') return null
    return { id: userId, role: cached.role }
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true, approvalStatus: true },
  })
  if (user) {
    cache.set(userId, { role: user.role, approvalStatus: user.approvalStatus, expiresAt: Date.now() + ttl })
    if (user.role === 'PET_OWNER' && user.approvalStatus !== 'APPROVED') return null
  } else {
    cache.delete(userId)
  }
  return user
}

export function invalidateAuthUser(userId: string) {
  cache.delete(userId)
}

export function clearAuthCache() {
  cache.clear()
}
