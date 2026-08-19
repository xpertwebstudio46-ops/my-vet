import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../auth/auth.middleware.js'
import { validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { sendSuccess } from '../../shared/utils/api-response.js'

const querySchema = paginationSchema.extend({
  category: z.enum(['APPOINTMENT', 'REVIEW', 'PRACTICE', 'SUBSCRIPTION', 'FEATURED_LISTING', 'SYSTEM']).optional(),
})
const idParams = z.object({ id: z.string().min(1) })

export const notificationsRouter = Router()
notificationsRouter.use(authenticate)

notificationsRouter.get('/', validateQuery(querySchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof querySchema>
  const where = { userId: request.user!.userId, ...(query.category ? { category: query.category } : {}) }
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(query.page, query.limit) }),
    prisma.notification.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

notificationsRouter.get('/unread-count', async (request, response) => {
  const count = await prisma.notification.count({ where: { userId: request.user!.userId, readAt: null } })
  sendSuccess(response, { count })
})

notificationsRouter.patch('/read-all', async (request, response) => {
  const result = await prisma.notification.updateMany({
    where: { userId: request.user!.userId, readAt: null },
    data: { readAt: new Date() },
  })
  sendSuccess(response, { updated: result.count })
})

notificationsRouter.patch('/:id/read', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.notification.updateMany({
    where: { id, userId: request.user!.userId },
    data: { readAt: new Date() },
  })
  if (!result.count) throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification was not found')
  sendSuccess(response, { read: true })
})

notificationsRouter.delete('/:id', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.notification.deleteMany({ where: { id, userId: request.user!.userId } })
  if (!result.count) throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification was not found')
  sendSuccess(response, { deleted: true })
})
