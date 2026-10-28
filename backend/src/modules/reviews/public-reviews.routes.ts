import { Router } from 'express'
import type { z } from 'zod'
import { prisma } from '../../config/database.js'
import { validateQuery } from '../../shared/middleware/validate.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'

export const publicReviewsRouter = Router()

publicReviewsRouter.get('/', validateQuery(paginationSchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof paginationSchema>
  const where = {
    status: 'APPROVED' as const,
    user: { deletedAt: null },
    practice: { status: 'APPROVED' as const, owner: { deletedAt: null } },
  }
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true, rating: true, comment: true, createdAt: true,
        user: { select: { firstName: true, lastName: true, avatar: true } },
        practice: { select: { name: true, slug: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...paginationToPrisma(query.page, query.limit),
    }),
    prisma.review.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})
