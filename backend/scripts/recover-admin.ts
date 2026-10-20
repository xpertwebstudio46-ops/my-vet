import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  const email = process.env.RECOVERY_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.RECOVERY_ADMIN_PASSWORD
  if (!databaseUrl || !email || !password) {
    throw new Error('DATABASE_URL, RECOVERY_ADMIN_EMAIL and RECOVERY_ADMIN_PASSWORD are required')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid recovery email')
  if (password.length < 10) throw new Error('Recovery password must contain at least 10 characters')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.user.findUnique({ where: { email }, select: { role: true } })
      if (existing && existing.role !== 'ADMIN') throw new Error('Refusing to change a non-admin account into an administrator')
      const user = await transaction.user.upsert({
        where: { email },
        update: { passwordHash, deletedAt: null, approvalStatus: 'APPROVED' },
        create: { email, passwordHash, role: 'ADMIN', approvalStatus: 'APPROVED', firstName: 'Site', lastName: 'Administrator' },
        select: { id: true, email: true },
      })
      const now = new Date()
      await transaction.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } })
      await transaction.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: now } })
      await transaction.adminSettings.upsert({ where: { adminUserId: user.id }, update: {}, create: { adminUserId: user.id } })
      return user
    })
    console.info(`Admin access restored for ${admin.email}. Old refresh sessions and password-reset links revoked.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Admin recovery failed')
  process.exitCode = 1
})
