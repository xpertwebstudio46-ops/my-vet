import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { getOwnedPractice } from '../vet/helpers.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginationSchema, paginated, paginationToPrisma } from '../../shared/utils/pagination.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import { jobApplicationRateLimiter } from '../../shared/middleware/rate-limiter.js'

const jobType = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'LOCUM'])
const idSchema = z.object({ id: z.string().min(1) })
const jobSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(30).max(20000),
  location: z.string().trim().min(2).max(200),
  type: jobType,
  salary: z.string().trim().max(150).optional(),
  closingDate: z.iso.datetime().nullable().optional(),
  status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
})
const applicationSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).optional(),
  coverLetter: z.string().trim().min(30).max(15000),
  cvUrl: z.union([z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS link'), z.literal('')]).optional(),
})
const searchSchema = paginationSchema.extend({ q: z.string().trim().max(200).optional(), location: z.string().trim().max(200).optional(), type: jobType.optional() })
const practiceSelect = { id: true, name: true, slug: true, city: true, logoUrl: true }
const publicWhere = (): Prisma.JobWhereInput => ({ status: 'OPEN', OR: [{ closingDate: null }, { closingDate: { gt: new Date() } }], practice: { status: 'APPROVED', owner: { deletedAt: null, approvalStatus: 'APPROVED' } } })

async function notifyAdmins(tx: Prisma.TransactionClient, title: string, message: string, entityId: string) {
  const admins = await tx.user.findMany({ where: { role: 'ADMIN', deletedAt: null }, select: { id: true } })
  return Promise.all(admins.map(({ id }) => createNotification(tx, { userId: id, category: 'SYSTEM', title, message, actionUrl: '/admin-dashboard/jobs', entityType: 'JOB', entityId })))
}

export const jobsRouter = Router()

jobsRouter.get('/', validateQuery(searchSchema), async (req, res) => {
  const query = req.validatedQuery as z.infer<typeof searchSchema>
  const where: Prisma.JobWhereInput = { AND: [publicWhere(), ...(query.q ? [{ OR: [{ title: { contains: query.q, mode: 'insensitive' as const } }, { description: { contains: query.q, mode: 'insensitive' as const } }, { practice: { name: { contains: query.q, mode: 'insensitive' as const } } }] }] : [])], ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}), ...(query.type ? { type: query.type } : {}) }
  const [items, total] = await Promise.all([prisma.job.findMany({ where, include: { practice: { select: practiceSelect } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], ...paginationToPrisma(query.page, query.limit) }), prisma.job.count({ where })])
  sendSuccess(res, paginated(items, total, query.page, query.limit))
})

jobsRouter.get('/mine', authenticate, requireRole('VET'), async (req, res) => {
  const practice = await getOwnedPractice(req.user!.userId)
  sendSuccess(res, await prisma.job.findMany({ where: { practiceId: practice.id }, include: { _count: { select: { applications: true } } }, orderBy: { createdAt: 'desc' } }))
})

jobsRouter.get('/applications/mine', authenticate, async (req, res) => {
  sendSuccess(res, await prisma.jobApplication.findMany({ where: { userId: req.user!.userId }, include: { job: { include: { practice: { select: practiceSelect } } } }, orderBy: { createdAt: 'desc' } }))
})

jobsRouter.get('/admin', authenticate, requireRole('ADMIN'), validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = req.validatedQuery as z.infer<typeof paginationSchema>
  const [items, total] = await Promise.all([prisma.job.findMany({ include: { practice: { select: practiceSelect }, _count: { select: { applications: true } } }, orderBy: { createdAt: 'desc' }, ...paginationToPrisma(page, limit) }), prisma.job.count()])
  sendSuccess(res, paginated(items, total, page, limit))
})

jobsRouter.post('/', authenticate, requireRole('VET'), validateBody(jobSchema), async (req, res) => {
  const practice = await getOwnedPractice(req.user!.userId)
  if (practice.status !== 'APPROVED') throw new ApiError(403, 'PRACTICE_NOT_APPROVED', 'Your practice must be approved before posting jobs')
  const input = req.validatedBody as z.infer<typeof jobSchema>
  if (input.closingDate && new Date(input.closingDate) <= new Date()) throw new ApiError(400, 'INVALID_DATE', 'Closing date must be in the future')
  const result = await prisma.$transaction(async (tx) => {
    const job = await tx.job.create({ data: { ...input, closingDate: input.closingDate ? new Date(input.closingDate) : null, practiceId: practice.id } })
    const notifications = await notifyAdmins(tx, 'New job posted', `${practice.name} posted ${job.title}.`, job.id)
    return { job, notifications }
  })
  emitNotifications(result.notifications)
  sendSuccess(res, result.job, 'Job posted', 201)
})

jobsRouter.patch('/:id', authenticate, requireRole('VET', 'ADMIN'), validateParams(idSchema), validateBody(jobSchema.partial()), async (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idSchema>
  const job = await prisma.job.findUnique({ where: { id }, include: { practice: true } })
  if (!job || (req.user!.role !== 'ADMIN' && job.practice.ownerId !== req.user!.userId)) throw new ApiError(404, 'JOB_NOT_FOUND', 'Job was not found')
  const input = req.validatedBody as Partial<z.infer<typeof jobSchema>>
  if (input.closingDate && new Date(input.closingDate) <= new Date()) throw new ApiError(400, 'INVALID_DATE', 'Closing date must be in the future')
  sendSuccess(res, await prisma.job.update({ where: { id }, data: { ...input, closingDate: input.closingDate === undefined ? undefined : input.closingDate ? new Date(input.closingDate) : null } }))
})

jobsRouter.get('/:id/applications', authenticate, requireRole('VET', 'ADMIN'), validateParams(idSchema), async (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idSchema>
  const job = await prisma.job.findUnique({ where: { id }, include: { practice: true } })
  if (!job || (req.user!.role !== 'ADMIN' && job.practice.ownerId !== req.user!.userId)) throw new ApiError(404, 'JOB_NOT_FOUND', 'Job was not found')
  sendSuccess(res, await prisma.jobApplication.findMany({ where: { jobId: id }, orderBy: { createdAt: 'desc' } }))
})

jobsRouter.patch('/applications/:id', authenticate, validateParams(idSchema), validateBody(z.object({ status: z.enum(['SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN']) })), async (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idSchema>
  const application = await prisma.jobApplication.findUnique({ where: { id }, include: { job: { include: { practice: true } } } })
  if (!application) throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Application was not found')
  const status = (req.validatedBody as { status: string }).status as 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN'
  const permitted = status === 'WITHDRAWN' ? application.userId === req.user!.userId : application.job.practice.ownerId === req.user!.userId || req.user!.role === 'ADMIN'
  if (!permitted) throw new ApiError(403, 'FORBIDDEN', 'You cannot update this application')
  if (application.status === 'WITHDRAWN') throw new ApiError(409, 'APPLICATION_WITHDRAWN', 'This application has been withdrawn')
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.jobApplication.update({ where: { id }, data: { status } })
    const recipientId = status === 'WITHDRAWN' ? application.job.practice.ownerId : application.userId
    const notification = recipientId ? await createNotification(tx, { userId: recipientId, category: 'SYSTEM', title: 'Job application updated', message: `${application.job.title}: ${status.toLowerCase()}.`, actionUrl: status === 'WITHDRAWN' ? '/vet-dashboard/jobs' : '/jobs?tab=applications', entityType: 'JOB_APPLICATION', entityId: id }) : null
    return { updated, notification }
  })
  emitNotifications(result.notification ? [result.notification] : [])
  sendSuccess(res, result.updated)
})

jobsRouter.get('/:id', validateParams(idSchema), async (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idSchema>
  const job = await prisma.job.findFirst({ where: { AND: [{ id }, publicWhere()] }, include: { practice: { select: practiceSelect } } })
  if (!job) throw new ApiError(404, 'JOB_NOT_FOUND', 'This job is no longer available')
  sendSuccess(res, job)
})

jobsRouter.post('/:id/apply', jobApplicationRateLimiter, (req, res, next) => req.get('authorization') ? authenticate(req, res, next) : next(), validateParams(idSchema), validateBody(applicationSchema), async (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idSchema>
  const input = req.validatedBody as z.infer<typeof applicationSchema>
  const result = await prisma.$transaction(async (tx) => {
    // Lock against a concurrent close/edit while accepting the application.
    await tx.$queryRaw`SELECT id FROM "Job" WHERE id = ${id} FOR UPDATE`
    const job = await tx.job.findFirst({ where: { AND: [{ id }, publicWhere()] }, include: { practice: true } })
    if (!job) throw new ApiError(409, 'JOB_CLOSED', 'This job is no longer accepting applications')
    if (req.user && (job.practice.ownerId === req.user.userId || req.user.role === 'ADMIN')) throw new ApiError(403, 'FORBIDDEN', 'Apply using an applicant account, not the hiring practice or admin account')
    if (await tx.jobApplication.findFirst({ where: { jobId: id, OR: [{ email: { equals: input.email, mode: 'insensitive' } }, ...(req.user ? [{ userId: req.user.userId }] : [])] } })) throw new ApiError(409, 'ALREADY_APPLIED', 'An application for this job has already been submitted with these details')
    const application = await tx.jobApplication.create({ data: { ...input, cvUrl: input.cvUrl || null, jobId: id, userId: req.user?.userId ?? null } })
    const notifications = await notifyAdmins(tx, 'New job application', `${input.name} applied for ${job.title} at ${job.practice.name}.`, id)
    notifications.push(await createNotification(tx, { userId: job.practice.ownerId, category: 'SYSTEM', title: 'New job application', message: `${input.name} applied for ${job.title}.`, actionUrl: '/vet-dashboard/jobs', entityType: 'JOB_APPLICATION', entityId: application.id }))
    if (req.user) notifications.push(await createNotification(tx, { userId: req.user.userId, category: 'SYSTEM', title: 'Application submitted', message: `Your application for ${job.title} has been sent to ${job.practice.name}.`, actionUrl: '/jobs?tab=applications', entityType: 'JOB_APPLICATION', entityId: application.id }))
    return { application, notifications }
  })
  emitNotifications(result.notifications)
  sendSuccess(res, result.application, 'Application submitted', 201)
})
