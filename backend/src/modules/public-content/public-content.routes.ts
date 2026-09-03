import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { contactRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { sendSuccess } from '../../shared/utils/api-response.js'

const slugParams = z.object({ slug: z.string().min(1).max(180) })
const newsletterSchema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) })

export const publicContentRouter = Router()

publicContentRouter.get('/blog', validateQuery(paginationSchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof paginationSchema>
  const where = { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } }
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        category: true,
        publishedAt: true,
        author: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { publishedAt: 'desc' },
      ...paginationToPrisma(query.page, query.limit),
    }),
    prisma.blogPost.count({ where }),
  ])
  response.setHeader('Cache-Control', 'no-store')
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

publicContentRouter.get('/blog/:slug', validateParams(slugParams), async (request, response) => {
  const { slug } = request.validatedParams as z.infer<typeof slugParams>
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverUrl: true,
      category: true,
      publishedAt: true,
      author: { select: { firstName: true, lastName: true, avatar: true } },
    },
  })
  if (!post) throw new ApiError(404, 'BLOG_POST_NOT_FOUND', 'Blog post was not found')
  response.setHeader('Cache-Control', 'no-store')
  sendSuccess(response, post)
})

publicContentRouter.get('/sponsorships', async (_request, response) => {
  const now = new Date()
  const sponsorships = await prisma.sponsorship.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    select: { id: true, name: true, description: true, imageUrl: true, websiteUrl: true },
    orderBy: { sortOrder: 'asc' },
  })
  response.setHeader('Cache-Control', 'no-store')
  sendSuccess(response, sponsorships)
})

publicContentRouter.post('/newsletter', contactRateLimiter, validateBody(newsletterSchema), async (request, response) => {
  const { email } = request.validatedBody as z.infer<typeof newsletterSchema>
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true, unsubscribedAt: null, subscribedAt: new Date() },
    create: { email },
  })
  sendSuccess(response, { subscribed: true }, 'You are subscribed', 201)
})
