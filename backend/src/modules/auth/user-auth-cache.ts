import type { Role } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'

interface CacheEntry {
  role: Role
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const ttl = 60_000

export async function getCurrentAuthUser(userId: string) {
  const cached = cache.get(userId)
  if (cached && cached.expiresAt > Date.now()) return { id: userId, role: cached.role }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  })
  if (user) cache.set(userId, { role: user.role, expiresAt: Date.now() + ttl })
  else cache.delete(userId)
  return user
}

export function invalidateAuthUser(userId: string) {
  cache.delete(userId)
}

export function clearAuthCache() {
  cache.clear()
}
