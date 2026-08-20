import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../../generated/prisma/client.js'
import { ContactActionType } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { analyticsWriteRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { toSlug } from '../../shared/utils/slug.js'

const practiceFields = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5_000).nullable().optional(),
  addressLine1: z.string().trim().min(2).max(200),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(2).max(100),
  county: z.string().trim().max(100).nullable().optional(),
  postcode: z.string().trim().min(2).max(20),
  phone: z.string().trim().min(5).max(30),
  email: z.email(),
  website: z.url().nullable().optional(),
  logoUrl: z.url().nullable().optional(),
  bannerUrl: z.url().nullable().optional(),
  timezone: z.string().trim().min(3).max(80).default('Europe/London'),
})
const createPracticeSchema = practiceFields
const updatePracticeSchema = practiceFields.partial()
const idParams = z.object({ id: z.string().min(1) })
const slugParams = z.object({ slug: z.string().min(1).max(180) })
const contactActionSchema = z.object({ type: z.enum(ContactActionType), source: z.string().trim().max(100).optional() })
const searchSchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  animalType: z.string().trim().max(100).optional(),
  service: z.string().trim().max(100).optional(),
  sort: z.enum(['rating', 'newest', 'name']).default('rating'),
})

function publicInclude() {
  return {
    services: { where: { active: true }, orderBy: { sortOrder: 'asc' as const } },
    facilities: { where: { active: true } },
    animalTypes: { include: { animalType: true } },
    openingHours: { orderBy: { dayOfWeek: 'asc' as const } },
    galleryMedia: { orderBy: { sortOrder: 'asc' as const } },
    pricing: { where: { active: true }, orderBy: { sortOrder: 'asc' as const } },
  }
}

function practiceDto<T extends { rating: Prisma.Decimal; services?: Array<{ price: Prisma.Decimal | null }>; pricing?: Array<{ price: Prisma.Decimal }> }>(practice: T) {
  const publicPractice = { ...practice } as Record<string, unknown>
  for (const privateField of ['ownerId', 'stripeCustomerId', 'moderationReason', 'legacyRatingTotal', 'legacyReviewCount']) {
    delete publicPractice[privateField]
  }
  return {
    ...publicPractice,
    rating: practice.rating.toString(),
    ...(practice.services ? { services: practice.services.map((service) => ({ ...service, price: service.price?.toString() ?? null })) } : {}),
    ...(practice.pricing ? { pricing: practice.pricing.map((item) => ({ ...item, price: item.price.toString() })) } : {}),
  }
}

export const practicesRouter = Router()

practicesRouter.get('/', validateQuery(searchSchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof searchSchema>
  const where: Prisma.PracticeWhereInput = {
    status: 'APPROVED',
    owner: { deletedAt: null },
  }
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ]
  }
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' }
  if (query.animalType) {
    where.animalTypes = { some: { animalType: { slug: query.animalType, active: true } } }
  }
  if (query.service) where.services = { some: { name: { contains: query.service, mode: 'insensitive' }, active: true } }
  const orderBy: Prisma.PracticeOrderByWithRelationInput =
    query.sort === 'newest' ? { createdAt: 'desc' } : query.sort === 'name' ? { name: 'asc' } : { rating: 'desc' }

  const [items, total] = await Promise.all([
    prisma.practice.findMany({
      where,
      orderBy,
      ...paginationToPrisma(query.page, query.limit),
      include: {
        services: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
        animalTypes: { include: { animalType: true } },
      },
    }),
    prisma.practice.count({ where }),
  ])
  sendSuccess(response, paginated(items.map(practiceDto), total, query.page, query.limit))
})

practicesRouter.get('/saved', authenticate, async (request, response) => {
  const saved = await prisma.savedPractice.findMany({
    where: { userId: request.user!.userId, practice: { status: 'APPROVED', owner: { deletedAt: null } } },
    include: { practice: true },
    orderBy: { createdAt: 'desc' },
  })
  sendSuccess(response, saved.map((item) => practiceDto(item.practice)))
})

practicesRouter.get('/:slug', validateParams(slugParams), async (request, response) => {
  const { slug } = request.validatedParams as z.infer<typeof slugParams>
  const practice = await prisma.practice.findFirst({
    where: { slug, status: 'APPROVED', owner: { deletedAt: null } },
    include: publicInclude(),
  })
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  void prisma.profileView.create({ data: { practiceId: practice.id } }).catch(() => undefined)
  sendSuccess(response, practiceDto(practice))
})

practicesRouter.post('/', authenticate, requireRole('VET'), validateBody(createPracticeSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof createPracticeSchema>
  const userId = request.user!.userId
  const baseSlug = toSlug(body.name) || 'practice'
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomBytes(3).toString('hex')}`
    try {
      const practice = await prisma.practice.create({ data: { ...body, slug, ownerId: userId } })
      sendSuccess(response, practiceDto(practice), 'Practice submitted for approval', 201)
      return
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error
      const existing = await prisma.practice.findUnique({ where: { ownerId: userId }, select: { id: true } })
      if (existing) throw new ApiError(409, 'PRACTICE_ALREADY_EXISTS', 'This account already owns a practice')
    }
  }
  throw new ApiError(409, 'SLUG_CONFLICT', 'Could not create a unique practice URL')
})

practicesRouter.put('/:id', authenticate, requireRole('VET'), validateParams(idParams), validateBody(updatePracticeSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.practice.findFirst({ where: { id, ownerId: request.user!.userId }, select: { id: true } })
  if (!existing) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  const practice = await prisma.practice.update({ where: { id }, data: request.validatedBody as z.infer<typeof updatePracticeSchema> })
  sendSuccess(response, practiceDto(practice), 'Practice updated')
})

practicesRouter.post('/:id/save', authenticate, validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const practice = await prisma.practice.findFirst({ where: { id, status: 'APPROVED', owner: { deletedAt: null } }, select: { id: true } })
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  const key = { userId_practiceId: { userId: request.user!.userId, practiceId: id } }
  const current = await prisma.savedPractice.findUnique({ where: key })
  if (current) {
    await prisma.savedPractice.delete({ where: key })
    sendSuccess(response, { saved: false })
  } else {
    await prisma.savedPractice.create({ data: { userId: request.user!.userId, practiceId: id } })
    sendSuccess(response, { saved: true }, null, 201)
  }
})

practicesRouter.post('/:id/contact-action', analyticsWriteRateLimiter, validateParams(idParams), validateBody(contactActionSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof contactActionSchema>
  const exists = await prisma.practice.count({ where: { id, status: 'APPROVED' } })
  if (!exists) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  await prisma.contactAction.create({ data: { practiceId: id, type: body.type, source: body.source } })
  sendSuccess(response, { recorded: true }, null, 201)
})
