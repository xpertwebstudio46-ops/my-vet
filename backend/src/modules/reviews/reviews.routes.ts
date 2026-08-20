import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { reviewRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import { recalculatePracticeRating } from './review-rating.service.js'

const createSchema = z.object({
  practiceId: z.string().min(1),
  appointmentId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).nullable().optional(),
  comment: z.string().trim().min(10).max(5_000),
})
const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(120).nullable().optional(),
  comment: z.string().trim().min(10).max(5_000).optional(),
})
const replySchema = z.object({ reply: z.string().trim().min(2).max(3_000) })
const idParams = z.object({ id: z.string().min(1) })
const practiceParams = z.object({ practiceId: z.string().min(1) })

export const reviewsRouter = Router()

reviewsRouter.get('/practice/:practiceId', validateParams(practiceParams), validateQuery(paginationSchema), async (request, response) => {
  const { practiceId } = request.validatedParams as z.infer<typeof practiceParams>
  const query = request.validatedQuery as z.infer<typeof paginationSchema>
  const where = { practiceId, status: 'APPROVED' as const }
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        reply: true,
        repliedAt: true,
        helpfulCount: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...paginationToPrisma(query.page, query.limit),
    }),
    prisma.review.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

reviewsRouter.use(authenticate)

reviewsRouter.get('/me', async (request, response) => {
  const reviews = await prisma.review.findMany({
    where: { userId: request.user!.userId },
    include: { practice: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })
  sendSuccess(response, reviews)
})

reviewsRouter.post('/', reviewRateLimiter, requireRole('PET_OWNER'), validateBody(createSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof createSchema>
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: body.appointmentId,
      practiceId: body.practiceId,
      userId: request.user!.userId,
      status: 'COMPLETED',
    },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!appointment) {
    throw new ApiError(400, 'COMPLETED_APPOINTMENT_REQUIRED', 'A completed appointment is required to review this practice')
  }
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const review = await transaction.review.create({
        data: { ...body, userId: request.user!.userId, status: 'PENDING' },
      })
      const notification = await createNotification(transaction, {
        userId: appointment.practice.ownerId,
        category: 'REVIEW',
        title: 'New review submitted',
        message: 'A new review is awaiting moderation',
        actionUrl: '/vet-dashboard/reviews',
      })
      return { review, notification }
    })
    emitNotifications([result.notification])
    sendSuccess(response, result.review, 'Review submitted for moderation', 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError(409, 'REVIEW_ALREADY_EXISTS', 'You have already reviewed this practice')
    }
    throw error
  }
})

reviewsRouter.put('/:id', requireRole('PET_OWNER'), validateParams(idParams), validateBody(updateSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.review.findFirst({ where: { id, userId: request.user!.userId } })
  if (!existing) throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review was not found')
  const review = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.review.update({
      where: { id },
      data: { ...(request.validatedBody as z.infer<typeof updateSchema>), status: 'PENDING', moderatedAt: null, moderatedById: null },
    })
    await recalculatePracticeRating(transaction, existing.practiceId)
    return updated
  })
  sendSuccess(response, review, 'Review updated and returned to moderation')
})

reviewsRouter.delete('/:id', requireRole('PET_OWNER'), validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.review.findFirst({ where: { id, userId: request.user!.userId } })
  if (!existing) throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review was not found')
  await prisma.$transaction(async (transaction) => {
    await transaction.review.delete({ where: { id } })
    await recalculatePracticeRating(transaction, existing.practiceId)
  })
  sendSuccess(response, { deleted: true }, 'Review deleted')
})

reviewsRouter.post('/:id/reply', requireRole('VET'), validateParams(idParams), validateBody(replySchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const { reply } = request.validatedBody as z.infer<typeof replySchema>
  const review = await prisma.review.findFirst({
    where: { id, practice: { ownerId: request.user!.userId } },
    select: { id: true, userId: true },
  })
  if (!review) throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review was not found')
  const result = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.review.update({ where: { id }, data: { reply, repliedAt: new Date() } })
    const notification = await createNotification(transaction, {
      userId: review.userId,
      category: 'REVIEW',
      title: 'Practice replied to your review',
      message: reply,
      actionUrl: '/my-reviews',
    })
    return { updated, notification }
  })
  emitNotifications([result.notification])
  sendSuccess(response, result.updated, 'Reply posted')
})

reviewsRouter.post('/:id/helpful', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  try {
    const review = await prisma.$transaction(async (transaction) => {
      await transaction.helpfulVote.create({ data: { reviewId: id, userId: request.user!.userId } })
      return transaction.review.update({ where: { id }, data: { helpfulCount: { increment: 1 } } })
    })
    sendSuccess(response, { helpful: true, helpfulCount: review.helpfulCount }, null, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError(409, 'ALREADY_MARKED_HELPFUL', 'You already marked this review helpful')
    }
    throw error
  }
})

reviewsRouter.delete('/:id/helpful', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.$transaction(async (transaction) => {
    const deleted = await transaction.helpfulVote.deleteMany({ where: { reviewId: id, userId: request.user!.userId } })
    if (!deleted.count) return null
    return transaction.review.update({ where: { id }, data: { helpfulCount: { decrement: 1 } } })
  })
  if (!result) throw new ApiError(404, 'HELPFUL_VOTE_NOT_FOUND', 'Helpful vote was not found')
  sendSuccess(response, { helpful: false, helpfulCount: result.helpfulCount })
})
