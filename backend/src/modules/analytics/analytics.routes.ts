import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { getOwnedPractice } from '../vet/helpers.js'

const querySchema = z.object({ months: z.coerce.number().int().min(1).max(24).default(12) })

function monthKeys(months: number) {
  const now = new Date()
  const result: string[] = []
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    result.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)).toISOString().slice(0, 7))
  }
  return result
}

export const analyticsRouter = Router()
analyticsRouter.use(authenticate, requireRole('VET'))

analyticsRouter.get('/vet', validateQuery(querySchema), async (request, response) => {
  const { months } = request.validatedQuery as z.infer<typeof querySchema>
  const practice = await getOwnedPractice(request.user!.userId)
  const subscription = await prisma.subscription.findUnique({ where: { practiceId: practice.id }, select: { status: true } })
  if (subscription && !['FREE', 'ACTIVE', 'TRIALING'].includes(subscription.status)) {
    throw new ApiError(403, 'ANALYTICS_NOT_ENTITLED', 'An active plan is required for analytics')
  }
  const keys = monthKeys(months)
  const start = new Date(`${keys[0]}-01T00:00:00.000Z`)
  const [views, actions] = await Promise.all([
    prisma.profileView.findMany({ where: { practiceId: practice.id, date: { gte: start } }, select: { date: true } }),
    prisma.contactAction.findMany({ where: { practiceId: practice.id, date: { gte: start } }, select: { date: true, type: true } }),
  ])
  const buckets = keys.map((month) => ({ month, views: 0, contacts: 0, bookings: 0 }))
  const byMonth = new Map(buckets.map((bucket) => [bucket.month, bucket]))
  for (const view of views) {
    const bucket = byMonth.get(view.date.toISOString().slice(0, 7))
    if (bucket) bucket.views += 1
  }
  for (const action of actions) {
    const bucket = byMonth.get(action.date.toISOString().slice(0, 7))
    if (bucket) {
      bucket.contacts += 1
      if (action.type === 'BOOKING') bucket.bookings += 1
    }
  }
  sendSuccess(response, { buckets, totals: { views: views.length, contacts: actions.length } })
})
