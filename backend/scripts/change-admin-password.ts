import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!databaseUrl || !email || !password) {
    throw new Error('DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD are required')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid admin email')
  if (password.length < 10) throw new Error('Admin password must contain at least 10 characters')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.user.findUnique({ where: { email }, select: { id: true, role: true, deletedAt: true } })
      if (!existing) throw new Error('No account found for ADMIN_EMAIL')
      if (existing.role !== 'ADMIN') throw new Error('ADMIN_EMAIL must belong to an existing administrator')
      if (existing.deletedAt) throw new Error('Admin account is deactivated; changing its password will not reactivate it')
      const user = await transaction.user.update({
        where: { id: existing.id },
        data: { passwordHash },
        select: { id: true, email: true },
      })
      const now = new Date()
      await transaction.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } })
      await transaction.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: now } })
      return user
    })
    console.info(`Admin password changed for ${admin.email}. Old refresh sessions and password-reset links revoked.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Admin password change failed')
  process.exitCode = 1
})
