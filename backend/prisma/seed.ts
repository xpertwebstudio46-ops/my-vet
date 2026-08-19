import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '../src/generated/prisma/client.js'

if (process.env.NODE_ENV === 'production') {
  throw new Error('Development seed is disabled in production')
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

async function main() {
  const passwordHash = await bcrypt.hash('MyVetDev123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@myvet.local' },
    update: { passwordHash, role: 'ADMIN', deletedAt: null },
    create: {
      id: 'seed_admin',
      email: 'admin@myvet.local',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  })
  const owner = await prisma.user.upsert({
    where: { email: 'owner@myvet.local' },
    update: { passwordHash, role: 'PET_OWNER', deletedAt: null },
    create: {
      id: 'seed_owner',
      email: 'owner@myvet.local',
      passwordHash,
      role: 'PET_OWNER',
      firstName: 'Pet',
      lastName: 'Owner',
    },
  })
  const vet = await prisma.user.upsert({
    where: { email: 'vet@myvet.local' },
    update: { passwordHash, role: 'VET', deletedAt: null },
    create: {
      id: 'seed_vet',
      email: 'vet@myvet.local',
      passwordHash,
      role: 'VET',
      firstName: 'Veterinary',
      lastName: 'Owner',
    },
  })

  await prisma.adminSettings.upsert({
    where: { adminUserId: admin.id },
    update: {},
    create: { adminUserId: admin.id, backupEmail: 'backup@myvet.local' },
  })

  const dog = await prisma.animalType.upsert({
    where: { slug: 'dogs' },
    update: { name: 'Dogs', active: true },
    create: { id: 'seed_animal_dog', name: 'Dogs', slug: 'dogs', icon: 'dog' },
  })
  await prisma.animalType.upsert({
    where: { slug: 'cats' },
    update: { name: 'Cats', active: true },
    create: { id: 'seed_animal_cat', name: 'Cats', slug: 'cats', icon: 'cat' },
  })
  const category = await prisma.serviceCategory.upsert({
    where: { slug: 'general-care' },
    update: { name: 'General Care', active: true },
    create: { id: 'seed_category_general', name: 'General Care', slug: 'general-care' },
  })

  const practice = await prisma.practice.upsert({
    where: { ownerId: vet.id },
    update: { status: 'APPROVED', rating: new Prisma.Decimal(5), reviewCount: 1 },
    create: {
      id: 'seed_practice',
      ownerId: vet.id,
      slug: 'my-vet-demo-practice',
      name: 'My Vet Demo Practice',
      description: 'A seeded veterinary practice for local development.',
      addressLine1: '1 Veterinary Way',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '020 0000 0000',
      email: 'practice@myvet.local',
      status: 'APPROVED',
      rating: new Prisma.Decimal(5),
      reviewCount: 1,
    },
  })

  await prisma.practiceAnimalType.upsert({
    where: { practiceId_animalTypeId: { practiceId: practice.id, animalTypeId: dog.id } },
    update: {},
    create: { practiceId: practice.id, animalTypeId: dog.id },
  })
  await prisma.service.upsert({
    where: { practiceId_name: { practiceId: practice.id, name: 'Consultation' } },
    update: { price: new Prisma.Decimal(45), active: true, categoryId: category.id },
    create: {
      id: 'seed_service_consultation',
      practiceId: practice.id,
      categoryId: category.id,
      name: 'Consultation',
      price: new Prisma.Decimal(45),
    },
  })
  await prisma.pricing.upsert({
    where: {
      practiceId_kind_section_name: {
        practiceId: practice.id,
        kind: 'SERVICE',
        section: 'Consultations',
        name: 'Standard consultation',
      },
    },
    update: { price: new Prisma.Decimal(45), active: true },
    create: {
      id: 'seed_pricing_consultation',
      practiceId: practice.id,
      kind: 'SERVICE',
      section: 'Consultations',
      name: 'Standard consultation',
      price: new Prisma.Decimal(45),
      billingPeriod: 'ONE_OFF',
    },
  })
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
    const weekend = dayOfWeek === 0 || dayOfWeek === 6
    await prisma.openingHours.upsert({
      where: { practiceId_dayOfWeek: { practiceId: practice.id, dayOfWeek } },
      update: { isClosed: weekend, opensAt: weekend ? null : '09:00', closesAt: weekend ? null : '18:00' },
      create: {
        practiceId: practice.id,
        dayOfWeek,
        isClosed: weekend,
        opensAt: weekend ? null : '09:00',
        closesAt: weekend ? null : '18:00',
      },
    })
  }

  const pet = await prisma.pet.upsert({
    where: { id: 'seed_pet' },
    update: { name: 'Buddy', species: 'Dog', animalTypeId: dog.id },
    create: { id: 'seed_pet', userId: owner.id, animalTypeId: dog.id, name: 'Buddy', species: 'Dog', breed: 'Labrador' },
  })
  const appointmentDate = new Date()
  appointmentDate.setUTCDate(appointmentDate.getUTCDate() - 7)
  appointmentDate.setUTCHours(0, 0, 0, 0)
  const appointment = await prisma.appointment.upsert({
    where: { id: 'seed_appointment' },
    update: { status: 'COMPLETED', completedAt: new Date() },
    create: {
      id: 'seed_appointment',
      userId: owner.id,
      practiceId: practice.id,
      petId: pet.id,
      date: appointmentDate,
      time: '10:00',
      reason: 'Annual check-up',
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })
  await prisma.review.upsert({
    where: { userId_practiceId: { userId: owner.id, practiceId: practice.id } },
    update: { rating: 5, status: 'APPROVED', comment: 'Excellent care and a friendly team.', appointmentId: appointment.id },
    create: {
      id: 'seed_review',
      userId: owner.id,
      practiceId: practice.id,
      appointmentId: appointment.id,
      rating: 5,
      title: 'Excellent care',
      comment: 'Excellent care and a friendly team.',
      status: 'APPROVED',
    },
  })
  await prisma.practice.update({ where: { id: practice.id }, data: { rating: new Prisma.Decimal(5), reviewCount: 1 } })

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: 'free' },
    update: { price: new Prisma.Decimal(0), active: true },
    create: {
      id: 'seed_plan_free',
      name: 'Free',
      slug: 'free',
      description: 'Essential directory listing',
      price: new Prisma.Decimal(0),
      features: { directoryListing: true },
    },
  })
  await prisma.subscription.upsert({
    where: { practiceId: practice.id },
    update: { planId: freePlan.id, status: 'FREE' },
    create: { id: 'seed_subscription', practiceId: practice.id, planId: freePlan.id, status: 'FREE' },
  })
  await prisma.featuredListingPlan.upsert({
    where: { tier: 'weekly' },
    update: { active: true, price: new Prisma.Decimal(25) },
    create: { id: 'seed_featured_weekly', name: 'Weekly Boost', tier: 'weekly', durationDays: 7, price: new Prisma.Decimal(25) },
  })

  console.info('Development seed complete')
  console.info('admin@myvet.local / MyVetDev123!')
  console.info('vet@myvet.local / MyVetDev123!')
  console.info('owner@myvet.local / MyVetDev123!')
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
