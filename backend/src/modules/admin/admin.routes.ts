import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { invalidateAuthUser } from '../auth/user-auth-cache.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { toSlug } from '../../shared/utils/slug.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import { mailService } from '../../shared/services/mail.service.js'
import { recalculatePracticeRating } from '../reviews/review-rating.service.js'
import { deleteUploadedAssetByUrl, markUploadAttached, requireUploadForAttachment } from '../upload/asset-attachment.service.js'
import { installAndSyncSubscriptionCatalog, syncSubscriptionPlan } from '../subscriptions/stripe-catalog.service.js'

const idParams = z.object({ id: z.string().min(1) })
const statusQuery = paginationSchema.extend({ status: z.string().trim().max(40).optional(), q: z.string().trim().max(100).optional() })
const practiceModerationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED']),
  reason: z.string().trim().min(3).max(1_000),
})
const reviewModerationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().trim().min(3).max(1_000).optional(),
})
const taxonomySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1_000).nullable().optional(),
  active: z.boolean().default(true),
  imageAssetId: z.string().min(1).nullable().optional(),
})
const animalTypeSchema = taxonomySchema.extend({ icon: z.string().trim().max(100).nullable().optional() })
const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().min(20).max(100_000),
  coverAssetId: z.string().min(1).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})
const sponsorshipFields = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2_000).nullable().optional(),
  imageAssetId: z.string().min(1).nullable().optional(),
  websiteUrl: z.url().nullable().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})
const sponsorshipSchema = sponsorshipFields
  .refine((value) => value.endsAt > value.startsAt, { message: 'End date must be after start date' })
const updateSponsorshipSchema = sponsorshipFields
  .partial()
  .refine((value) => !value.startsAt || !value.endsAt || value.endsAt > value.startsAt, {
    message: 'End date must be after start date',
  })
const enquirySchema = z.object({ status: z.enum(['NEW', 'IN_PROGRESS', 'REPLIED', 'CLOSED']) })
const replySchema = z.object({ reply: z.string().trim().min(2).max(10_000) })
const userUpdateSchema = z.object({
  role: z.enum(['PET_OWNER', 'VET', 'ADMIN']).optional(),
  deactivated: z.boolean().optional(),
})
const settingsSchema = z.object({
  backupEmail: z.email().nullable().optional(),
  locale: z.string().trim().min(2).max(20).optional(),
  emailNotifications: z.boolean().optional(),
  moderationNotifications: z.boolean().optional(),
  billingNotifications: z.boolean().optional(),
})
const planSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2_000).nullable().optional(),
  price: z.coerce.number().positive().max(1_000_000),
  currency: z.literal('GBP').default('GBP'),
  billingPeriod: z.literal('MONTHLY').default('MONTHLY'),
  features: z.record(z.string(), z.unknown()).default({}),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})
const featuredPlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tier: z.string().trim().min(2).max(80),
  durationDays: z.number().int().min(1).max(365),
  price: z.coerce.number().nonnegative().max(1_000_000),
  currency: z.string().length(3).transform((value) => value.toUpperCase()).default('GBP'),
  stripePriceId: z.string().trim().nullable().optional(),
  active: z.boolean().default(true),
})
const featuredListingStatusSchema = z.object({ status: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED']) })
const reportSchema = z
  .object({ start: z.coerce.date(), end: z.coerce.date() })
  .refine((value) => value.end >= value.start && value.end.valueOf() - value.start.valueOf() <= 366 * 86_400_000, {
    message: 'Report range must be ordered and no longer than 366 days',
  })

export const adminRouter = Router()
adminRouter.use(authenticate, requireRole('ADMIN'))

adminRouter.get('/dashboard', async (_request, response) => {
  const [users, practices, pendingPractices, pendingReviews, activeSubscriptions, revenue, recentPractices] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.practice.count(),
    prisma.practice.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIALING'] } } }),
    prisma.subscriptionInvoice.aggregate({ _sum: { amountPaid: true } }),
    prisma.practice.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, status: true, createdAt: true } }),
  ])
  sendSuccess(response, {
    totals: { users, practices, pendingPractices, pendingReviews, activeSubscriptions, revenue: revenue._sum.amountPaid?.toString() ?? '0' },
    recentPractices,
  })
})

adminRouter.get('/practices', validateQuery(statusQuery), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof statusQuery>
  const where: Prisma.PracticeWhereInput = {}
  if (query.status && ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED'].includes(query.status)) {
    where.status = query.status as Prisma.EnumPracticeStatusFilter['equals']
  }
  if (query.q) where.name = { contains: query.q, mode: 'insensitive' }
  const [items, total] = await Promise.all([
    prisma.practice.findMany({ where, include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(query.page, query.limit) }),
    prisma.practice.count({ where }),
  ])
  sendSuccess(response, paginated(items.map((item) => ({ ...item, rating: item.rating.toString() })), total, query.page, query.limit))
})

adminRouter.patch('/practices/:id/status', validateParams(idParams), validateBody(practiceModerationSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof practiceModerationSchema>
  const practice = await prisma.practice.findUnique({ where: { id }, select: { id: true, ownerId: true, name: true } })
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  const result = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.practice.update({ where: { id }, data: { status: body.status, moderationReason: body.reason } })
    await transaction.auditLog.create({
      data: { actorId: request.user!.userId, action: `PRACTICE_${body.status}`, entityType: 'Practice', entityId: id, reason: body.reason },
    })
    const notification = await createNotification(transaction, {
      userId: practice.ownerId,
      category: 'PRACTICE',
      title: `Practice ${body.status.toLowerCase()}`,
      message: body.reason,
      actionUrl: '/vet-dashboard/practice-profile',
    })
    return { updated, notification }
  })
  emitNotifications([result.notification])
  sendSuccess(response, result.updated, 'Practice status updated')
})

adminRouter.get('/reviews', validateQuery(statusQuery), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof statusQuery>
  const where: Prisma.ReviewWhereInput = {}
  if (query.status && ['PENDING', 'APPROVED', 'REJECTED', 'DISPUTED'].includes(query.status)) {
    where.status = query.status as Prisma.EnumReviewStatusFilter['equals']
  }
  const [items, total] = await Promise.all([
    prisma.review.findMany({ where, include: { user: { select: { firstName: true, lastName: true, email: true } }, practice: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(query.page, query.limit) }),
    prisma.review.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

adminRouter.patch('/reviews/:id/moderate', validateParams(idParams), validateBody(reviewModerationSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof reviewModerationSchema>
  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      practiceId: true,
      userId: true,
      status: true,
      practice: { select: { name: true, ownerId: true } },
    },
  })
  if (!review) throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review was not found')
  const result = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.review.update({
      where: { id },
      data: {
        status: body.status,
        moderatedAt: new Date(),
        moderatedById: request.user!.userId,
        disputeReason: null,
        disputedAt: null,
        disputedById: null,
      },
    })
    await recalculatePracticeRating(transaction, review.practiceId)
    await transaction.auditLog.create({
      data: { actorId: request.user!.userId, action: `REVIEW_${body.status}`, entityType: 'Review', entityId: id, reason: body.reason },
    })
    const reviewerNotification = await createNotification(transaction, {
      userId: review.userId,
      category: 'REVIEW',
      title: `Review ${body.status.toLowerCase()}`,
      message: body.reason ?? `Your review was ${body.status.toLowerCase()}`,
      actionUrl: '/my-reviews',
    })
    const vetNotification = body.status === 'APPROVED'
      ? await createNotification(transaction, {
        userId: review.practice.ownerId,
        category: 'REVIEW',
        title: review.status === 'DISPUTED' ? 'Review dispute resolved' : 'Review approved',
        message: review.status === 'DISPUTED'
          ? `Admin reviewed your report for ${review.practice.name} and kept the review published`
          : `${review.practice.name} has a new approved review`,
        actionUrl: '/vet-dashboard/reviews',
      })
      : review.status === 'DISPUTED'
        ? await createNotification(transaction, {
          userId: review.practice.ownerId,
          category: 'REVIEW',
          title: 'Disputed review removed',
          message: `Admin reviewed your report for ${review.practice.name} and removed the inappropriate review`,
          actionUrl: '/vet-dashboard/reviews',
        })
        : null
    return { updated, notifications: vetNotification ? [reviewerNotification, vetNotification] : [reviewerNotification] }
  })
  emitNotifications(result.notifications)
  sendSuccess(response, result.updated, 'Review moderated')
})

interface TaxonomyDelegate {
  findMany(args: { orderBy: { name: 'asc' } }): Promise<unknown[]>
  create(args: { data: Record<string, unknown> }): Promise<unknown>
  findFirst(args: { where: { id: string }; select: { id: true; imageUrl: true } }): Promise<{ id: string; imageUrl: string | null } | null>
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>
  delete(args: { where: { id: string } }): Promise<unknown>
}

function taxonomyRoutes(path: string, schema: z.ZodObject, delegateName: 'animalType' | 'serviceCategory') {
  const delegate = prisma[delegateName] as unknown as TaxonomyDelegate
  adminRouter.get(path, async (_request, response) => sendSuccess(response, await delegate.findMany({ orderBy: { name: 'asc' } })))
  adminRouter.post(path, validateBody(schema), async (request, response) => {
    const { imageAssetId, ...body } = request.validatedBody as Record<string, unknown> & { name: string; imageAssetId?: string | null }
    const asset = imageAssetId ? await requireUploadForAttachment(imageAssetId, 'TAXONOMY', { ownerUserId: request.user!.userId }) : null
    const item = await prisma.$transaction(async (transaction) => {
      const transactionDelegate = transaction[delegateName] as unknown as TaxonomyDelegate
      const created = await transactionDelegate.create({ data: { ...body, imageUrl: asset?.url ?? null, slug: toSlug(body.name) } })
      if (asset) await markUploadAttached(transaction, asset.id)
      return created
    })
    sendSuccess(response, item, 'Created', 201)
  })
  adminRouter.put(`${path}/:id`, validateParams(idParams), validateBody(schema.partial()), async (request, response) => {
    const { id } = request.validatedParams as z.infer<typeof idParams>
    const existing = await delegate.findFirst({ where: { id }, select: { id: true, imageUrl: true } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Record was not found')
    const { imageAssetId, ...body } = request.validatedBody as Record<string, unknown> & { name?: string; imageAssetId?: string | null }
    const asset = imageAssetId ? await requireUploadForAttachment(imageAssetId, 'TAXONOMY', { ownerUserId: request.user!.userId }) : null
    const item = await prisma.$transaction(async (transaction) => {
      const transactionDelegate = transaction[delegateName] as unknown as TaxonomyDelegate
      const updated = await transactionDelegate.update({
        where: { id },
        data: { ...body, ...(imageAssetId !== undefined ? { imageUrl: asset?.url ?? null } : {}), ...(body.name ? { slug: toSlug(body.name) } : {}) },
      })
      if (asset) await markUploadAttached(transaction, asset.id)
      return updated
    })
    if (imageAssetId !== undefined) {
      await deleteUploadedAssetByUrl(existing.imageUrl, ['TAXONOMY'], {}).catch(() => undefined)
    }
    sendSuccess(response, item, 'Updated')
  })
  adminRouter.delete(`${path}/:id`, validateParams(idParams), async (request, response) => {
    const { id } = request.validatedParams as z.infer<typeof idParams>
    const existing = await delegate.findFirst({ where: { id }, select: { id: true, imageUrl: true } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Record was not found')
    await delegate.delete({ where: { id } })
    await deleteUploadedAssetByUrl(existing.imageUrl, ['TAXONOMY'], {}).catch(() => undefined)
    sendSuccess(response, { deleted: true })
  })
}

taxonomyRoutes('/animal-types', animalTypeSchema, 'animalType')
taxonomyRoutes('/service-categories', taxonomySchema, 'serviceCategory')

adminRouter.get('/blog', async (_request, response) => sendSuccess(response, await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })))
adminRouter.post('/blog', validateBody(blogSchema), async (request, response) => {
  const { coverAssetId, ...body } = request.validatedBody as z.infer<typeof blogSchema>
  const asset = coverAssetId ? await requireUploadForAttachment(coverAssetId, 'BLOG', { ownerUserId: request.user!.userId }) : null
  const post = await prisma.$transaction(async (transaction) => {
    const created = await transaction.blogPost.create({
      data: { ...body, coverUrl: asset?.url ?? null, slug: toSlug(body.title), authorId: request.user!.userId, publishedAt: body.status === 'PUBLISHED' ? new Date() : null },
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return created
  })
  sendSuccess(response, post, 'Blog post created', 201)
})
adminRouter.put('/blog/:id', validateParams(idParams), validateBody(blogSchema.partial()), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { coverUrl: true } })
  if (!existing) throw new ApiError(404, 'BLOG_NOT_FOUND', 'Blog post was not found')
  const { coverAssetId, ...body } = request.validatedBody as z.infer<typeof blogSchema>
  const asset = coverAssetId ? await requireUploadForAttachment(coverAssetId, 'BLOG', { ownerUserId: request.user!.userId }) : null
  const post = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.blogPost.update({
      where: { id },
      data: { ...body, ...(coverAssetId !== undefined ? { coverUrl: asset?.url ?? null } : {}), ...(body.title ? { slug: toSlug(body.title) } : {}), ...(body.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}) },
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return updated
  })
  if (coverAssetId !== undefined && existing.coverUrl !== post.coverUrl) {
    await deleteUploadedAssetByUrl(existing.coverUrl, ['BLOG'], {}).catch(() => undefined)
  }
  sendSuccess(response, post, 'Blog post updated')
})
adminRouter.delete('/blog/:id', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { coverUrl: true } })
  if (!existing) throw new ApiError(404, 'BLOG_NOT_FOUND', 'Blog post was not found')
  await prisma.blogPost.delete({ where: { id } })
  await deleteUploadedAssetByUrl(existing.coverUrl, ['BLOG'], {}).catch(() => undefined)
  sendSuccess(response, { deleted: true })
})

adminRouter.get('/sponsorships', async (_request, response) => sendSuccess(response, await prisma.sponsorship.findMany({ orderBy: { createdAt: 'desc' } })))
adminRouter.post('/sponsorships', validateBody(sponsorshipSchema), async (request, response) => {
  const { imageAssetId, ...body } = request.validatedBody as z.infer<typeof sponsorshipFields>
  const asset = imageAssetId ? await requireUploadForAttachment(imageAssetId, 'SPONSORSHIP', { ownerUserId: request.user!.userId }) : null
  const item = await prisma.$transaction(async (transaction) => {
    const created = await transaction.sponsorship.create({ data: { ...body, imageUrl: asset?.url ?? null } })
    if (asset) await markUploadAttached(transaction, asset.id)
    return created
  })
  sendSuccess(response, item, 'Sponsorship created', 201)
})
adminRouter.put('/sponsorships/:id', validateParams(idParams), validateBody(updateSponsorshipSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.sponsorship.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'SPONSORSHIP_NOT_FOUND', 'Sponsorship was not found')
  const { imageAssetId, ...body } = request.validatedBody as z.infer<typeof sponsorshipFields>
  const asset = imageAssetId ? await requireUploadForAttachment(imageAssetId, 'SPONSORSHIP', { ownerUserId: request.user!.userId }) : null
  const item = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.sponsorship.update({
      where: { id },
      data: { ...body, ...(imageAssetId !== undefined ? { imageUrl: asset?.url ?? null } : {}) },
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return updated
  })
  if (imageAssetId !== undefined && existing.imageUrl !== item.imageUrl) {
    await deleteUploadedAssetByUrl(existing.imageUrl, ['SPONSORSHIP'], {}).catch(() => undefined)
  }
  sendSuccess(response, item, 'Sponsorship updated')
})
adminRouter.delete('/sponsorships/:id', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.sponsorship.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'SPONSORSHIP_NOT_FOUND', 'Sponsorship was not found')
  await prisma.sponsorship.delete({ where: { id } })
  await deleteUploadedAssetByUrl(existing.imageUrl, ['SPONSORSHIP'], {}).catch(() => undefined)
  sendSuccess(response, { deleted: true })
})

adminRouter.get('/enquiries', validateQuery(statusQuery), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof statusQuery>
  const where: Prisma.ContactEnquiryWhereInput = {}
  if (query.status && ['NEW', 'IN_PROGRESS', 'REPLIED', 'CLOSED'].includes(query.status)) {
    where.status = query.status as Prisma.EnumEnquiryStatusFilter['equals']
  }
  const [items, total] = await Promise.all([
    prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(query.page, query.limit) }),
    prisma.contactEnquiry.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})
adminRouter.patch('/enquiries/:id', validateParams(idParams), validateBody(enquirySchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  sendSuccess(response, await prisma.contactEnquiry.update({ where: { id }, data: request.validatedBody as z.infer<typeof enquirySchema> }))
})
adminRouter.post('/enquiries/:id/reply', validateParams(idParams), validateBody(replySchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const { reply } = request.validatedBody as z.infer<typeof replySchema>
  const enquiry = await prisma.contactEnquiry.update({
    where: { id },
    data: { reply, status: 'REPLIED', repliedAt: new Date(), repliedById: request.user!.userId },
  })
  void mailService.send({ to: enquiry.email, subject: `Re: ${enquiry.subject}`, text: reply }).catch(() => undefined)
  sendSuccess(response, enquiry, 'Reply recorded')
})

adminRouter.get('/users', validateQuery(statusQuery), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof statusQuery>
  const where: Prisma.UserWhereInput = query.q
    ? { OR: [{ email: { contains: query.q, mode: 'insensitive' } }, { firstName: { contains: query.q, mode: 'insensitive' } }, { lastName: { contains: query.q, mode: 'insensitive' } }] }
    : {}
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, email: true, role: true, firstName: true, lastName: true, deletedAt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(query.page, query.limit) }),
    prisma.user.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})
adminRouter.patch('/users/:id', validateParams(idParams), validateBody(userUpdateSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof userUpdateSchema>
  if (id === request.user!.userId && (body.deactivated || (body.role && body.role !== 'ADMIN'))) {
    throw new ApiError(400, 'CANNOT_DEACTIVATE_SELF', 'Use another admin account for this change')
  }
  const user = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.user.update({
      where: { id },
      data: { ...(body.role ? { role: body.role } : {}), ...(body.deactivated !== undefined ? { deletedAt: body.deactivated ? new Date() : null } : {}) },
      select: { id: true, email: true, role: true, deletedAt: true },
    })
    await transaction.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    return updated
  })
  invalidateAuthUser(id)
  sendSuccess(response, user, 'User updated and sessions revoked')
})

adminRouter.get('/subscription-plans', async (_request, response) => {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } })
  sendSuccess(response, plans.map((plan) => ({ ...plan, price: plan.price.toString() })))
})
adminRouter.post('/subscription-plans/sync-stripe', async (_request, response) => {
  const plans = await installAndSyncSubscriptionCatalog()
  sendSuccess(
    response,
    plans.map((plan) => ({ ...plan, price: plan.price.toString() })),
    'Stripe subscription catalog synced',
  )
})
adminRouter.post('/subscription-plans', validateBody(planSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof planSchema>
  const item = await prisma.subscriptionPlan.create({
    data: { ...body, slug: body.slug ?? toSlug(body.name), features: body.features as Prisma.InputJsonValue },
  })
  const synced = await syncSubscriptionPlan(item.id)
  sendSuccess(response, { ...synced, price: synced.price.toString() }, 'Plan created and synced to Stripe', 201)
})
adminRouter.put('/subscription-plans/:id', validateParams(idParams), validateBody(planSchema.partial()), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof planSchema>
  const { features, ...data } = body
  const item = await prisma.subscriptionPlan.update({
    where: { id },
    data: { ...data, ...(features ? { features: features as Prisma.InputJsonValue } : {}) },
  })
  const synced = await syncSubscriptionPlan(item.id)
  sendSuccess(response, { ...synced, price: synced.price.toString() }, 'Plan updated and synced to Stripe')
})

adminRouter.get('/featured-listing-plans', async (_request, response) => {
  const plans = await prisma.featuredListingPlan.findMany({ orderBy: { price: 'asc' } })
  sendSuccess(response, plans.map((plan) => ({ ...plan, price: plan.price.toString() })))
})

adminRouter.get('/featured-listings', async (_request, response) => {
  const items = await prisma.featuredListing.findMany({
    include: { practice: { select: { id: true, name: true } }, plan: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  sendSuccess(response, items.map((item) => ({ ...item, plan: { ...item.plan, price: item.plan.price.toString() } })))
})

adminRouter.patch('/featured-listings/:id/status', validateParams(idParams), validateBody(featuredListingStatusSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const { status } = request.validatedBody as z.infer<typeof featuredListingStatusSchema>
  const existing = await prisma.featuredListing.findUnique({ where: { id }, include: { plan: true } })
  if (!existing) throw new ApiError(404, 'FEATURED_LISTING_NOT_FOUND', 'Featured listing was not found')
  const startsAt = status === 'ACTIVE' ? new Date() : existing.startsAt
  const endsAt = status === 'ACTIVE' ? new Date(Date.now() + existing.plan.durationDays * 86_400_000) : existing.endsAt
  const item = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.featuredListing.update({ where: { id }, data: { status, startsAt, endsAt } })
    await transaction.practice.update({
      where: { id: existing.practiceId },
      data: { isFeatured: status === 'ACTIVE', featuredUntil: status === 'ACTIVE' ? endsAt : null },
    })
    return updated
  })
  sendSuccess(response, item, 'Featured listing status updated')
})
adminRouter.post('/featured-listing-plans', validateBody(featuredPlanSchema), async (request, response) => {
  const item = await prisma.featuredListingPlan.create({ data: request.validatedBody as z.infer<typeof featuredPlanSchema> })
  sendSuccess(response, { ...item, price: item.price.toString() }, 'Featured plan created', 201)
})
adminRouter.put('/featured-listing-plans/:id', validateParams(idParams), validateBody(featuredPlanSchema.partial()), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const item = await prisma.featuredListingPlan.update({ where: { id }, data: request.validatedBody as z.infer<typeof featuredPlanSchema> })
  sendSuccess(response, { ...item, price: item.price.toString() }, 'Featured plan updated')
})

adminRouter.get('/settings', async (request, response) => {
  const settings = await prisma.adminSettings.findUnique({ where: { adminUserId: request.user!.userId } })
  sendSuccess(response, settings)
})
adminRouter.put('/settings', validateBody(settingsSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof settingsSchema>
  const settings = await prisma.adminSettings.upsert({
    where: { adminUserId: request.user!.userId },
    update: body,
    create: { ...body, adminUserId: request.user!.userId },
  })
  sendSuccess(response, settings, 'Settings updated')
})

adminRouter.get('/reports/overview', validateQuery(reportSchema), async (request, response) => {
  const { start, end } = request.validatedQuery as z.infer<typeof reportSchema>
  const endInclusive = new Date(end)
  endInclusive.setUTCHours(23, 59, 59, 999)
  const [signups, invoices, views, searches, topPractices] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: start, lte: endInclusive } }, select: { createdAt: true } }),
    prisma.subscriptionInvoice.findMany({ where: { paidAt: { gte: start, lte: endInclusive } }, select: { amountPaid: true, paidAt: true } }),
    prisma.profileView.count({ where: { date: { gte: start, lte: endInclusive } } }),
    prisma.searchEvent.count({ where: { createdAt: { gte: start, lte: endInclusive } } }),
    prisma.practice.findMany({ where: { status: 'APPROVED' }, orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }], take: 10, select: { id: true, name: true, rating: true, reviewCount: true } }),
  ])
  const months = new Map<string, { signups: number; revenue: Prisma.Decimal }>()
  for (const user of signups) {
    const key = user.createdAt.toISOString().slice(0, 7)
    const bucket = months.get(key) ?? { signups: 0, revenue: new Prisma.Decimal(0) }
    bucket.signups += 1
    months.set(key, bucket)
  }
  for (const invoice of invoices) {
    const key = invoice.paidAt.toISOString().slice(0, 7)
    const bucket = months.get(key) ?? { signups: 0, revenue: new Prisma.Decimal(0) }
    bucket.revenue = bucket.revenue.plus(invoice.amountPaid)
    months.set(key, bucket)
  }
  sendSuccess(response, {
    months: [...months.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([month, value]) => ({ month, signups: value.signups, revenue: value.revenue.toString() })),
    traffic: { views, searches },
    totalRevenue: invoices.reduce((total, invoice) => total.plus(invoice.amountPaid), new Prisma.Decimal(0)).toString(),
    topPractices: topPractices.map((practice) => ({ ...practice, rating: practice.rating.toString() })),
  })
})

adminRouter.get('/reports/export.csv', validateQuery(reportSchema), async (request, response) => {
  const { start, end } = request.validatedQuery as z.infer<typeof reportSchema>
  const endInclusive = new Date(end)
  endInclusive.setUTCHours(23, 59, 59, 999)
  const invoices = await prisma.subscriptionInvoice.findMany({
    where: { paidAt: { gte: start, lte: endInclusive } },
    include: { practice: { select: { name: true } } },
    orderBy: { paidAt: 'asc' },
    take: 10_000,
  })
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const rows = ['invoice_id,practice,amount,currency,paid_at']
  for (const invoice of invoices) {
    rows.push([invoice.stripeInvoiceId, invoice.practice.name, invoice.amountPaid.toString(), invoice.currency, invoice.paidAt.toISOString()].map(escape).join(','))
  }
  response.type('text/csv').attachment('my-vet-revenue.csv').send(rows.join('\n'))
})
