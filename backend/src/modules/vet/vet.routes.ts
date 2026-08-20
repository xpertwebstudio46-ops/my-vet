import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { getStripe } from '../../config/stripe.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateBody, validateParams } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { deleteR2Object } from '../upload/upload.service.js'
import { getOwnedPractice } from './helpers.js'

const idParams = z.object({ id: z.string().min(1) })
const animalParams = z.object({ animalTypeId: z.string().min(1) })
const serviceSchema = z.object({
  categoryId: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2_000).nullable().optional(),
  price: z.coerce.number().nonnegative().max(1_000_000).nullable().optional(),
  currency: z.string().length(3).transform((value) => value.toUpperCase()).default('GBP'),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})
const facilitySchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2_000).nullable().optional(),
  icon: z.string().trim().max(100).nullable().optional(),
  active: z.boolean().default(true),
})
const teamSchema = z.object({
  name: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(150),
  bio: z.string().trim().max(3_000).nullable().optional(),
  imageUrl: z.url().nullable().optional(),
  qualifications: z.string().trim().max(1_000).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})
const hoursItemSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
    closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  })
  .refine((value) => value.isClosed || Boolean(value.opensAt && value.closesAt && value.opensAt < value.closesAt), {
    message: 'Open days require an opening time before the closing time',
  })
const hoursSchema = z
  .array(hoursItemSchema)
  .length(7)
  .refine((items) => new Set(items.map((item) => item.dayOfWeek)).size === 7, 'Each day must appear once')
const holidaySchema = z.object({
  date: z.coerce.date(),
  isClosed: z.boolean().default(true),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
})
const emergencySchema = z.object({
  enabled: z.boolean(),
  phone: z.string().trim().max(30).nullable().optional(),
  instructions: z.string().trim().max(2_000).nullable().optional(),
})
const gallerySchema = z.object({
  assetId: z.string().min(1),
  altText: z.string().trim().max(200).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
})
const galleryUpdateSchema = z
  .object({
    altText: z.string().trim().max(200).nullable().optional(),
    caption: z.string().trim().max(500).nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one gallery field is required')
const pricingSchema = z.object({
  kind: z.enum(['SERVICE', 'HEALTH_PACKAGE']),
  section: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2_000).nullable().optional(),
  price: z.coerce.number().nonnegative().max(1_000_000),
  currency: z.string().length(3).transform((value) => value.toUpperCase()).default('GBP'),
  billingPeriod: z.enum(['ONE_OFF', 'MONTHLY', 'YEARLY']).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})
const checkoutSchema = z.object({ planId: z.string().min(1), successUrl: z.url(), cancelUrl: z.url() })

export const vetRouter = Router()
vetRouter.use(authenticate, requireRole('VET'))

vetRouter.get('/dashboard', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const [upcomingAppointments, pendingReviews, views, contacts] = await Promise.all([
    prisma.appointment.count({ where: { practiceId: practice.id, date: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] } } }),
    prisma.review.count({ where: { practiceId: practice.id, status: 'PENDING' } }),
    prisma.profileView.count({ where: { practiceId: practice.id } }),
    prisma.contactAction.count({ where: { practiceId: practice.id } }),
  ])
  sendSuccess(response, {
    practice: { ...practice, rating: practice.rating.toString() },
    stats: { upcomingAppointments, pendingReviews, views, contacts },
  })
})

function registerCrud(
  path: string,
  schema: z.ZodObject,
  delegateName: 'service' | 'facility' | 'teamMember',
) {
  interface CrudDelegate {
    findMany(args: { where: { practiceId: string }; orderBy: { createdAt: 'asc' } }): Promise<unknown[]>
    create(args: { data: Record<string, unknown> }): Promise<unknown>
    findFirst(args: {
      where: { id: string; practiceId: string }
      select: { id: true }
    }): Promise<{ id: string } | null>
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>
    deleteMany(args: { where: { id: string; practiceId: string } }): Promise<{ count: number }>
  }
  const delegate = prisma[delegateName] as unknown as CrudDelegate
  vetRouter.get(path, async (request, response) => {
    const practice = await getOwnedPractice(request.user!.userId)
    const items = await delegate.findMany({ where: { practiceId: practice.id }, orderBy: { createdAt: 'asc' } })
    sendSuccess(response, items)
  })
  vetRouter.post(path, validateBody(schema), async (request, response) => {
    const practice = await getOwnedPractice(request.user!.userId)
    const item = await delegate.create({
      data: { ...(request.validatedBody as Record<string, unknown>), practiceId: practice.id },
    })
    sendSuccess(response, item, 'Created', 201)
  })
  vetRouter.put(`${path}/:id`, validateParams(idParams), validateBody(schema.partial()), async (request, response) => {
    const practice = await getOwnedPractice(request.user!.userId)
    const { id } = request.validatedParams as z.infer<typeof idParams>
    const existing = await delegate.findFirst({ where: { id, practiceId: practice.id }, select: { id: true } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Record was not found')
    const item = await delegate.update({ where: { id }, data: request.validatedBody as Record<string, unknown> })
    sendSuccess(response, item, 'Updated')
  })
  vetRouter.delete(`${path}/:id`, validateParams(idParams), async (request, response) => {
    const practice = await getOwnedPractice(request.user!.userId)
    const { id } = request.validatedParams as z.infer<typeof idParams>
    const result = await delegate.deleteMany({ where: { id, practiceId: practice.id } })
    if (!result.count) throw new ApiError(404, 'NOT_FOUND', 'Record was not found')
    sendSuccess(response, { deleted: true })
  })
}

registerCrud('/services', serviceSchema, 'service')
registerCrud('/facilities', facilitySchema, 'facility')
registerCrud('/team-members', teamSchema, 'teamMember')

vetRouter.get('/opening-hours', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const [openingHours, holidayHours, emergencyHours] = await Promise.all([
    prisma.openingHours.findMany({ where: { practiceId: practice.id }, orderBy: { dayOfWeek: 'asc' } }),
    prisma.holidayHours.findMany({ where: { practiceId: practice.id }, orderBy: { date: 'asc' } }),
    prisma.emergencyHours.findUnique({ where: { practiceId: practice.id } }),
  ])
  sendSuccess(response, { openingHours, holidayHours, emergencyHours })
})

vetRouter.put('/opening-hours', validateBody(hoursSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const hours = request.validatedBody as z.infer<typeof hoursSchema>
  await prisma.$transaction(async (transaction) => {
    await transaction.openingHours.deleteMany({ where: { practiceId: practice.id } })
    await transaction.openingHours.createMany({ data: hours.map((item) => ({ ...item, practiceId: practice.id })) })
  })
  sendSuccess(response, { updated: 7 }, 'Opening hours updated')
})

vetRouter.post('/holiday-hours', validateBody(holidaySchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const item = await prisma.holidayHours.create({
    data: { ...(request.validatedBody as z.infer<typeof holidaySchema>), practiceId: practice.id },
  })
  sendSuccess(response, item, 'Holiday hours added', 201)
})

vetRouter.delete('/holiday-hours/:id', validateParams(idParams), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.holidayHours.deleteMany({ where: { id, practiceId: practice.id } })
  if (!result.count) throw new ApiError(404, 'HOLIDAY_HOURS_NOT_FOUND', 'Holiday hours were not found')
  sendSuccess(response, { deleted: true })
})

vetRouter.put('/emergency-hours', validateBody(emergencySchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const body = request.validatedBody as z.infer<typeof emergencySchema>
  const item = await prisma.emergencyHours.upsert({
    where: { practiceId: practice.id },
    update: body,
    create: { ...body, practiceId: practice.id },
  })
  sendSuccess(response, item, 'Emergency hours updated')
})

vetRouter.get('/animal-types', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const types = await prisma.animalType.findMany({
    where: { active: true },
    include: { practices: { where: { practiceId: practice.id }, select: { practiceId: true } } },
    orderBy: { name: 'asc' },
  })
  sendSuccess(response, types.map((type) => ({ ...type, selected: type.practices.length > 0, practices: undefined })))
})

vetRouter.post('/animal-types/:animalTypeId/toggle', validateParams(animalParams), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { animalTypeId } = request.validatedParams as z.infer<typeof animalParams>
  const type = await prisma.animalType.findFirst({ where: { id: animalTypeId, active: true }, select: { id: true } })
  if (!type) throw new ApiError(404, 'ANIMAL_TYPE_NOT_FOUND', 'Animal type was not found')
  const key = { practiceId_animalTypeId: { practiceId: practice.id, animalTypeId } }
  const current = await prisma.practiceAnimalType.findUnique({ where: key })
  if (current) {
    await prisma.practiceAnimalType.delete({ where: key })
    sendSuccess(response, { selected: false })
  } else {
    await prisma.practiceAnimalType.create({ data: { practiceId: practice.id, animalTypeId } })
    sendSuccess(response, { selected: true }, null, 201)
  }
})

vetRouter.get('/gallery', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  sendSuccess(response, await prisma.galleryMedia.findMany({ where: { practiceId: practice.id }, orderBy: { sortOrder: 'asc' } }))
})

vetRouter.post('/gallery', validateBody(gallerySchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const body = request.validatedBody as z.infer<typeof gallerySchema>
  const asset = await prisma.uploadedAsset.findFirst({
    where: { id: body.assetId, practiceId: practice.id, purpose: 'GALLERY' },
  })
  if (!asset) throw new ApiError(400, 'INVALID_GALLERY_ASSET', 'Gallery asset is not owned by this practice')
  const media = await prisma.$transaction(async (transaction) => {
    const created = await transaction.galleryMedia.create({
      data: { ...body, practiceId: practice.id, key: asset.key, url: asset.url },
    })
    await transaction.uploadedAsset.update({ where: { id: asset.id }, data: { attachedAt: new Date() } })
    return created
  })
  sendSuccess(response, media, 'Gallery media added', 201)
})

vetRouter.put('/gallery/:id', validateParams(idParams), validateBody(galleryUpdateSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.galleryMedia.findFirst({ where: { id, practiceId: practice.id }, select: { id: true } })
  if (!existing) throw new ApiError(404, 'GALLERY_MEDIA_NOT_FOUND', 'Gallery media was not found')
  const media = await prisma.galleryMedia.update({
    where: { id },
    data: request.validatedBody as z.infer<typeof galleryUpdateSchema>,
  })
  sendSuccess(response, media, 'Gallery media updated')
})

vetRouter.delete('/gallery/:id', validateParams(idParams), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const media = await prisma.galleryMedia.findFirst({ where: { id, practiceId: practice.id }, include: { asset: true } })
  if (!media) throw new ApiError(404, 'GALLERY_MEDIA_NOT_FOUND', 'Gallery media was not found')
  await deleteR2Object(media.key)
  await prisma.$transaction([
    prisma.galleryMedia.delete({ where: { id } }),
    prisma.uploadedAsset.delete({ where: { id: media.assetId } }),
  ])
  sendSuccess(response, { deleted: true }, 'Gallery media deleted')
})

vetRouter.get('/pricing', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const items = await prisma.pricing.findMany({ where: { practiceId: practice.id }, orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }] })
  sendSuccess(response, items.map((item) => ({ ...item, price: item.price.toString() })))
})

vetRouter.post('/pricing', validateBody(pricingSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const item = await prisma.pricing.create({ data: { ...(request.validatedBody as z.infer<typeof pricingSchema>), practiceId: practice.id } })
  sendSuccess(response, { ...item, price: item.price.toString() }, 'Pricing added', 201)
})

vetRouter.put('/pricing/:id', validateParams(idParams), validateBody(pricingSchema.partial()), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const exists = await prisma.pricing.count({ where: { id, practiceId: practice.id } })
  if (!exists) throw new ApiError(404, 'PRICING_NOT_FOUND', 'Pricing item was not found')
  const item = await prisma.pricing.update({ where: { id }, data: request.validatedBody as z.infer<typeof pricingSchema> })
  sendSuccess(response, { ...item, price: item.price.toString() }, 'Pricing updated')
})

vetRouter.delete('/pricing/:id', validateParams(idParams), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.pricing.deleteMany({ where: { id, practiceId: practice.id } })
  if (!result.count) throw new ApiError(404, 'PRICING_NOT_FOUND', 'Pricing item was not found')
  sendSuccess(response, { deleted: true })
})

vetRouter.get('/featured-listing/plans', async (_request, response) => {
  const plans = await prisma.featuredListingPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } })
  sendSuccess(response, plans.map((plan) => ({ ...plan, price: plan.price.toString() })))
})

vetRouter.get('/featured-listing/stats', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const listing = await prisma.featuredListing.findFirst({ where: { practiceId: practice.id }, orderBy: { createdAt: 'desc' } })
  if (!listing) return sendSuccess(response, { listing: null, impressions: 0, clicks: 0, enquiries: 0, clickThroughRate: 0 })
  const range = { gte: listing.startsAt ?? listing.createdAt, ...(listing.endsAt ? { lte: listing.endsAt } : {}) }
  const [impressions, clicks, enquiries] = await Promise.all([
    prisma.profileView.count({ where: { practiceId: practice.id, date: range } }),
    prisma.contactAction.count({ where: { practiceId: practice.id, date: range } }),
    prisma.contactAction.count({ where: { practiceId: practice.id, type: { in: ['EMAIL', 'PHONE', 'BOOKING'] }, date: range } }),
  ])
  sendSuccess(response, { listing, impressions, clicks, enquiries, clickThroughRate: impressions ? clicks / impressions : 0 })
})

vetRouter.get('/featured-listing', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const listing = await prisma.featuredListing.findFirst({ where: { practiceId: practice.id }, include: { plan: true }, orderBy: { createdAt: 'desc' } })
  sendSuccess(response, listing ? { ...listing, plan: { ...listing.plan, price: listing.plan.price.toString() } } : null)
})

vetRouter.post('/featured-listing/checkout', validateBody(checkoutSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const body = request.validatedBody as z.infer<typeof checkoutSchema>
  const plan = await prisma.featuredListingPlan.findFirst({ where: { id: body.planId, active: true } })
  if (!plan?.stripePriceId) throw new ApiError(400, 'FEATURED_PLAN_UNAVAILABLE', 'Featured listing plan is unavailable')
  const overlap = await prisma.featuredListing.count({
    where: { practiceId: practice.id, status: { in: ['PENDING', 'ACTIVE'] }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
  })
  if (overlap) throw new ApiError(409, 'FEATURED_LISTING_ACTIVE', 'A featured listing is already active or pending')
  const listing = await prisma.featuredListing.create({ data: { practiceId: practice.id, planId: plan.id } })
  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        customer: practice.stripeCustomerId ?? undefined,
        metadata: { kind: 'featured_listing', listingId: listing.id, practiceId: practice.id, planId: plan.id },
      },
      { idempotencyKey: `featured-listing-${listing.id}` },
    )
    await prisma.featuredListing.update({ where: { id: listing.id }, data: { stripeSessionId: session.id } })
    sendSuccess(response, { checkoutUrl: session.url }, 'Checkout created', 201)
  } catch (error) {
    await prisma.featuredListing.delete({ where: { id: listing.id } }).catch(() => undefined)
    throw error
  }
})
