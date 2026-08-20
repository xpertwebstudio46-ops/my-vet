import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '../src/generated/prisma/client.js'

const CONFIRMATION = 'IMPORT_MY_VET_DATA'

type PracticeImport = {
  slug: string
  name: string
  description: string
  mission?: string
  addressLine1: string
  city: string
  postcode: string
  phone: string
  image: string
  rating: number
  reviewCount: number
  featured?: boolean
  services: string[]
  animalTypes: string[]
}

const practices: PracticeImport[] = [
  {
    slug: 'greenfield-veterinary-surgery',
    name: 'Greenfield Veterinary Surgery',
    description: 'A welcoming Manchester veterinary surgery providing dependable everyday and urgent care for companion animals.',
    addressLine1: '24 Greenfield Road',
    city: 'Manchester',
    postcode: 'M20 3YA',
    phone: '0161 555 0140',
    image: '/images/practice-1.png',
    rating: 4.9,
    reviewCount: 248,
    services: ['Small Animals', 'Emergency Care', 'Surgery'],
    animalTypes: ['Dogs', 'Cats'],
  },
  {
    slug: 'riverside-animal-clinic',
    name: 'Riverside Animal Clinic',
    description: 'A Bristol clinic offering thoughtful veterinary care for small animals and exotic pets, including dentistry and routine treatment.',
    addressLine1: '18 Riverside Walk',
    city: 'Bristol',
    postcode: 'BS1 6QA',
    phone: '0117 555 0186',
    image: '/images/vet-1.png',
    rating: 4.8,
    reviewCount: 186,
    services: ['Exotics', 'Small Animals', 'Dental'],
    animalTypes: ['Dogs', 'Cats', 'Exotic Pets'],
  },
  {
    slug: 'highland-farm-vets',
    name: 'Highland Farm Vets',
    description: 'Mobile and clinic-based veterinary support for horses and farm animals across Edinburgh and the surrounding area.',
    addressLine1: '7 Highland Park',
    city: 'Edinburgh',
    postcode: 'EH12 7TF',
    phone: '0131 555 0312',
    image: '/images/practice-3.png',
    rating: 4.7,
    reviewCount: 312,
    services: ['Equine', 'Farm Animals', 'Mobile'],
    animalTypes: ['Horses', 'Farm Animals'],
  },
  {
    slug: 'oakwood-pet-health-centre',
    name: 'Oakwood Pet Health Centre',
    description: 'A modern Birmingham pet health centre offering preventative care, diagnostics, and surgery for cats and dogs.',
    addressLine1: '31 Oakwood Avenue',
    city: 'Birmingham',
    postcode: 'B15 2TT',
    phone: '0121 555 0421',
    image: '/images/vet-2.png',
    rating: 5,
    reviewCount: 421,
    services: ['Vaccinations', 'Diagnostics', 'Surgery'],
    animalTypes: ['Dogs', 'Cats'],
  },
  {
    slug: 'oakwood-veterinary-centre',
    name: 'Oakwood Veterinary Centre',
    description: 'Oakwood Veterinary Centre has been providing exceptional care to the pets of Leeds for over 20 years. Our state-of-the-art facility is equipped with modern technology to support high-quality treatment.',
    mission: 'To provide compassionate, comprehensive and advanced veterinary care in a warm, welcoming environment for pets and their owners.',
    addressLine1: '12 Oakwood Lane',
    city: 'Leeds',
    postcode: 'LS1 1AB',
    phone: '0113 123 4567',
    image: '/images/vet-1.png',
    rating: 4.9,
    reviewCount: 312,
    featured: true,
    services: ['Vaccinations', 'Surgery', 'Dental Care'],
    animalTypes: ['Dogs', 'Cats'],
  },
  {
    slug: 'meadow-view-equine-clinic',
    name: 'Meadow View Equine Clinic',
    description: 'Meadow View Equine Clinic specialises in horse health across Yorkshire, offering both in-clinic and mobile veterinary services.',
    mission: 'To keep every horse healthy, comfortable and performing at its best through expert, compassionate treatment.',
    addressLine1: '45 Meadow View Road',
    city: 'York',
    postcode: 'YO1 2CD',
    phone: '01904 123 456',
    image: '/images/vet-2.png',
    rating: 4.8,
    reviewCount: 187,
    featured: true,
    services: ['Lameness Exams', 'Dentistry', 'Mobile Unit'],
    animalTypes: ['Horses'],
  },
  {
    slug: 'city-pets-hospital',
    name: 'City Pets Hospital',
    description: "City Pets Hospital is central London's round-the-clock emergency and general veterinary hospital, staffed by experienced vets and nurses.",
    mission: 'To be there for pets and their owners in every moment that matters, day or night.',
    addressLine1: '8 City Road',
    city: 'London',
    postcode: 'EC1V 2NX',
    phone: '020 7123 4567',
    image: '/images/practice-3.png',
    rating: 4.6,
    reviewCount: 254,
    services: ['24/7 Emergency', 'ICU', 'Imaging'],
    animalTypes: ['Dogs', 'Cats', 'Exotic Pets'],
  },
  {
    slug: 'countryside-farm-vets',
    name: 'Countryside Farm Vets',
    description: 'Countryside Farm Vets supports livestock farmers across Devon with routine herd health, emergency callouts and specialist large-animal expertise.',
    mission: 'To support animal health and farm productivity through practical on-site veterinary care.',
    addressLine1: 'Fieldgate Farm',
    city: 'Devon',
    postcode: 'EX1 3AB',
    phone: '01392 123 456',
    image: '/images/practice-2.png',
    rating: 4.7,
    reviewCount: 98,
    services: ['Herd Health', 'TB Testing', 'Emergency Calving'],
    animalTypes: ['Farm Animals'],
  },
]

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function main() {
  if (process.env.CONFIRM_PRODUCTION_BOOTSTRAP !== CONFIRMATION) {
    throw new Error(`Refusing to import. Set CONFIRM_PRODUCTION_BOOTSTRAP=${CONFIRMATION} for this one-time command.`)
  }

  const databaseUrl = required('DATABASE_URL')
  const adminEmail = required('BOOTSTRAP_ADMIN_EMAIL').toLowerCase()
  const adminPassword = required('BOOTSTRAP_ADMIN_PASSWORD')
  if (adminPassword.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
    const shouldResetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === 'true'
    const adminPasswordHash = !existingAdmin || shouldResetPassword ? await bcrypt.hash(adminPassword, 12) : undefined
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: 'ADMIN',
        deletedAt: null,
        ...(adminPasswordHash ? { passwordHash: adminPasswordHash } : {}),
      },
      create: {
        email: adminEmail,
        passwordHash: adminPasswordHash!,
        role: 'ADMIN',
        firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim() || 'Site',
        lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim() || 'Administrator',
      },
    })
    await prisma.adminSettings.upsert({
      where: { adminUserId: admin.id },
      update: {},
      create: { adminUserId: admin.id, backupEmail: process.env.BOOTSTRAP_ADMIN_BACKUP_EMAIL?.trim().toLowerCase() || null },
    })

    const lockedOwnerPassword = await bcrypt.hash(randomBytes(48).toString('base64url'), 12)
    const category = await prisma.serviceCategory.upsert({
      where: { slug: 'featured-services' },
      update: { name: 'Featured services', active: true },
      create: { name: 'Featured services', slug: 'featured-services' },
    })

    for (const item of practices) {
      const ownerEmail = `imported+${item.slug}@myvet.invalid`
      const owner = await prisma.user.upsert({
        where: { email: ownerEmail },
        update: { role: 'VET', deletedAt: null },
        create: {
          email: ownerEmail,
          passwordHash: lockedOwnerPassword,
          role: 'VET',
          firstName: item.name,
          lastName: 'Imported listing',
        },
      })

      const slugCollision = await prisma.practice.findUnique({ where: { slug: item.slug }, select: { ownerId: true } })
      if (slugCollision && slugCollision.ownerId !== owner.id) {
        throw new Error(`Cannot import ${item.slug}: that slug belongs to another owner`)
      }

      await prisma.$transaction(async (transaction) => {
        const legacyRatingTotal = new Prisma.Decimal(item.rating).mul(item.reviewCount)
        const practice = await transaction.practice.upsert({
          where: { ownerId: owner.id },
          update: {
            slug: item.slug,
            name: item.name,
            description: [item.description, item.mission].filter(Boolean).join('\n\n'),
            addressLine1: item.addressLine1,
            city: item.city,
            postcode: item.postcode,
            phone: item.phone,
            email: `contact+${item.slug}@myvet.invalid`,
            bannerUrl: item.image,
            status: 'APPROVED',
            isFeatured: item.featured ?? false,
            legacyRatingTotal,
            legacyReviewCount: item.reviewCount,
          },
          create: {
            ownerId: owner.id,
            slug: item.slug,
            name: item.name,
            description: [item.description, item.mission].filter(Boolean).join('\n\n'),
            addressLine1: item.addressLine1,
            city: item.city,
            postcode: item.postcode,
            phone: item.phone,
            email: `contact+${item.slug}@myvet.invalid`,
            bannerUrl: item.image,
            status: 'APPROVED',
            isFeatured: item.featured ?? false,
            rating: new Prisma.Decimal(item.rating),
            reviewCount: item.reviewCount,
            legacyRatingTotal,
            legacyReviewCount: item.reviewCount,
          },
        })

        for (const [sortOrder, name] of item.services.entries()) {
          await transaction.service.upsert({
            where: { practiceId_name: { practiceId: practice.id, name } },
            update: { categoryId: category.id, active: true, sortOrder },
            create: { practiceId: practice.id, categoryId: category.id, name, sortOrder },
          })
        }
        for (const name of item.animalTypes) {
          const slug = slugify(name)
          const animalType = await transaction.animalType.upsert({
            where: { slug },
            update: { name, active: true },
            create: { name, slug },
          })
          await transaction.practiceAnimalType.upsert({
            where: { practiceId_animalTypeId: { practiceId: practice.id, animalTypeId: animalType.id } },
            update: {},
            create: { practiceId: practice.id, animalTypeId: animalType.id },
          })
        }
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
          const isClosed = dayOfWeek === 0
          await transaction.openingHours.upsert({
            where: { practiceId_dayOfWeek: { practiceId: practice.id, dayOfWeek } },
            update: { isClosed, opensAt: isClosed ? null : '08:30', closesAt: isClosed ? null : dayOfWeek === 6 ? '13:00' : '18:00' },
            create: { practiceId: practice.id, dayOfWeek, isClosed, opensAt: isClosed ? null : '08:30', closesAt: isClosed ? null : dayOfWeek === 6 ? '13:00' : '18:00' },
          })
        }

        const approvedReviews = await transaction.review.aggregate({
          where: { practiceId: practice.id, status: 'APPROVED' },
          _sum: { rating: true },
          _count: { rating: true },
        })
        const totalCount = item.reviewCount + approvedReviews._count.rating
        const totalRating = legacyRatingTotal.add(approvedReviews._sum.rating ?? 0)
        await transaction.practice.update({
          where: { id: practice.id },
          data: { rating: totalCount === 0 ? 0 : totalRating.div(totalCount), reviewCount: totalCount },
        })
      })
    }

    console.info(`Production bootstrap complete: 1 admin and ${practices.length} practice listings are ready.`)
    if (existingAdmin && !shouldResetPassword) console.info('The existing admin password was preserved.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
