import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../../generated/prisma/client.js'
import type { AppointmentStatus } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { paginated, paginationSchema, paginationToPrisma } from '../../shared/utils/pagination.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const createSchema = z.object({
  practiceId: z.string().min(1),
  petId: z.string().min(1),
  date: z.string().regex(datePattern),
  time: z.string().regex(timePattern),
  reason: z.string().trim().min(3).max(500),
  notes: z.string().trim().max(2_000).nullable().optional(),
})
const updateSchema = z.object({
  date: z.string().regex(datePattern).optional(),
  time: z.string().regex(timePattern).optional(),
  reason: z.string().trim().min(3).max(500).optional(),
  notes: z.string().trim().max(2_000).nullable().optional(),
})
const cancelSchema = z.object({ reason: z.string().trim().min(2).max(500) })
const idParams = z.object({ id: z.string().min(1) })
const listSchema = paginationSchema.extend({
  view: z.enum(['upcoming', 'previous', 'all']).default('upcoming'),
  status: z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
})

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, 'INVALID_APPOINTMENT_DATE', 'Appointment date is invalid')
  }
  return date
}

function currentLocalSlot(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}` }
}

function assertFutureSlot(date: string, time: string, timezone: string) {
  try {
    const now = currentLocalSlot(timezone)
    if (date < now.date || (date === now.date && time <= now.time)) {
      throw new ApiError(400, 'APPOINTMENT_IN_PAST', 'Appointment must be in the future')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, 'INVALID_TIMEZONE', 'Practice timezone is invalid')
  }
}

function appointmentWhere(userId: string, query: z.infer<typeof listSchema>): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = { userId }
  const today = new Date(new Date().toISOString().slice(0, 10))
  if (query.view === 'upcoming') where.date = { gte: today }
  if (query.view === 'previous') where.date = { lt: today }
  if (query.status) where.status = query.status
  return where
}

function mapSlotError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ApiError(409, 'APPOINTMENT_SLOT_TAKEN', 'That appointment slot is no longer available')
  }
  throw error
}

export const appointmentsRouter = Router()
appointmentsRouter.use(authenticate)

appointmentsRouter.get('/', validateQuery(listSchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof listSchema>
  const where = appointmentWhere(request.user!.userId, query)
  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { pet: true, practice: { select: { id: true, name: true, slug: true, timezone: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      ...paginationToPrisma(query.page, query.limit),
    }),
    prisma.appointment.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

appointmentsRouter.get('/vet', requireRole('VET'), validateQuery(listSchema), async (request, response) => {
  const query = request.validatedQuery as z.infer<typeof listSchema>
  const practice = await prisma.practice.findUnique({ where: { ownerId: request.user!.userId }, select: { id: true } })
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  const where: Prisma.AppointmentWhereInput = { ...appointmentWhere('', query), userId: undefined, practiceId: practice.id }
  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { pet: true, user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      ...paginationToPrisma(query.page, query.limit),
    }),
    prisma.appointment.count({ where }),
  ])
  sendSuccess(response, paginated(items, total, query.page, query.limit))
})

appointmentsRouter.post('/', requireRole('PET_OWNER'), validateBody(createSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof createSchema>
  const userId = request.user!.userId
  const [practice, pet] = await Promise.all([
    prisma.practice.findFirst({
      where: { id: body.practiceId, status: 'APPROVED', owner: { deletedAt: null } },
      select: { id: true, ownerId: true, timezone: true },
    }),
    prisma.pet.findFirst({ where: { id: body.petId, userId }, select: { id: true } }),
  ])
  if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Practice was not found')
  if (!pet) throw new ApiError(400, 'INVALID_PET', 'Pet does not belong to this account')
  assertFutureSlot(body.date, body.time, practice.timezone)

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const appointment = await transaction.appointment.create({
        data: { ...body, date: parseDate(body.date), userId },
      })
      const notification = await createNotification(transaction, {
        userId: practice.ownerId,
        category: 'APPOINTMENT',
        title: 'New appointment request',
        message: `A new appointment was requested for ${body.date} at ${body.time}`,
        actionUrl: '/vet-dashboard',
      })
      return { appointment, notification }
    })
    emitNotifications([result.notification])
    sendSuccess(response, result.appointment, 'Appointment booked', 201)
  } catch (error) {
    mapSlotError(error)
  }
})

appointmentsRouter.put('/:id', requireRole('PET_OWNER'), validateParams(idParams), validateBody(updateSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof updateSchema>
  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: request.user!.userId },
    include: { practice: { select: { ownerId: true, timezone: true } } },
  })
  if (!appointment) throw new ApiError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found')
  if (!['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(appointment.status)) {
    throw new ApiError(409, 'INVALID_APPOINTMENT_TRANSITION', 'This appointment cannot be rescheduled')
  }
  const dateText = body.date ?? appointment.date.toISOString().slice(0, 10)
  const time = body.time ?? appointment.time
  assertFutureSlot(dateText, time, appointment.practice.timezone)

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.appointment.update({
        where: { id },
        data: { ...body, ...(body.date ? { date: parseDate(body.date) } : {}), status: 'RESCHEDULED' },
      })
      const notification = await createNotification(transaction, {
        userId: appointment.practice.ownerId,
        category: 'APPOINTMENT',
        title: 'Appointment rescheduled',
        message: `An appointment was moved to ${dateText} at ${time}`,
        actionUrl: '/vet-dashboard',
      })
      return { updated, notification }
    })
    emitNotifications([result.notification])
    sendSuccess(response, result.updated, 'Appointment rescheduled')
  } catch (error) {
    mapSlotError(error)
  }
})

appointmentsRouter.patch('/:id/cancel', validateParams(idParams), validateBody(cancelSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const { reason } = request.validatedBody as z.infer<typeof cancelSchema>
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!appointment) throw new ApiError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found')
  const isOwner = appointment.userId === request.user!.userId
  const isVet = appointment.practice.ownerId === request.user!.userId
  if (!isOwner && !isVet) throw new ApiError(403, 'FORBIDDEN', 'You cannot cancel this appointment')
  if (!['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(appointment.status)) {
    throw new ApiError(409, 'INVALID_APPOINTMENT_TRANSITION', 'This appointment cannot be cancelled')
  }
  const recipient = isOwner ? appointment.practice.ownerId : appointment.userId
  const result = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason, cancelledAt: new Date() },
    })
    const notification = await createNotification(transaction, {
      userId: recipient,
      category: 'APPOINTMENT',
      title: 'Appointment cancelled',
      message: reason,
      actionUrl: isOwner ? '/vet-dashboard' : '/appointment-history',
    })
    return { updated, notification }
  })
  emitNotifications([result.notification])
  sendSuccess(response, result.updated, 'Appointment cancelled')
})

async function vetTransition(
  request: Parameters<Parameters<typeof appointmentsRouter.patch>[1]>[0],
  status: AppointmentStatus,
) {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const appointment = await prisma.appointment.findFirst({
    where: { id, practice: { ownerId: request.user!.userId } },
  })
  if (!appointment) throw new ApiError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found')
  const allowed = status === 'CONFIRMED' ? ['PENDING', 'RESCHEDULED'] : ['CONFIRMED']
  if (!allowed.includes(appointment.status)) {
    throw new ApiError(409, 'INVALID_APPOINTMENT_TRANSITION', `Appointment cannot be marked ${status.toLowerCase()}`)
  }
  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.appointment.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : { completedAt: new Date() }),
      },
    })
    const notification = await createNotification(transaction, {
      userId: appointment.userId,
      category: 'APPOINTMENT',
      title: status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment completed',
      message: status === 'CONFIRMED' ? 'Your appointment has been confirmed' : 'Your appointment has been completed',
      actionUrl: '/appointment-history',
    })
    return { updated, notification }
  })
}

appointmentsRouter.patch('/:id/confirm', requireRole('VET'), validateParams(idParams), async (request, response) => {
  const result = await vetTransition(request, 'CONFIRMED')
  emitNotifications([result.notification])
  sendSuccess(response, result.updated, 'Appointment confirmed')
})

appointmentsRouter.patch('/:id/complete', requireRole('VET'), validateParams(idParams), async (request, response) => {
  const result = await vetTransition(request, 'COMPLETED')
  emitNotifications([result.notification])
  sendSuccess(response, result.updated, 'Appointment completed')
})
