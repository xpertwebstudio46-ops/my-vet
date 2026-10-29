import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { validateBody, validateParams } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { getOwnedPractice } from './helpers.js'

const price = z.number().finite().nonnegative().max(1_000_000).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, 'Use up to two decimal places')
export const calloutAreaSchema = z.object({
  location: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  postcodes: z.array(z.string().trim().min(1).max(10).regex(/^[a-z0-9 ]+$/i, 'Use letters, numbers and spaces')).max(40).default([]).transform((values) => [...new Set(values.map((value) => value.toUpperCase()))]),
  days: z.array(z.number().int().min(0).max(6)).min(1, 'Choose at least one day').max(7).refine((days) => new Set(days).size === days.length, 'Do not repeat weekdays'),
  standardMin: price,
  standardMax: price,
  reducedMin: price,
  reducedMax: price,
  active: z.boolean().default(true),
}).superRefine((value, context) => {
  for (const [field, condition, message] of [
    ['standardMax', value.standardMax < value.standardMin, 'Maximum standard cost must be at least the minimum'],
    ['reducedMax', value.reducedMax < value.reducedMin, 'Maximum reduced cost must be at least the minimum'],
    ['reducedMin', value.reducedMin > value.standardMin, 'Reduced minimum cannot exceed standard minimum'],
    ['reducedMax', value.reducedMax > value.standardMax, 'Reduced maximum cannot exceed standard maximum'],
  ] as const) {
    if (condition) context.addIssue({ code: 'custom', path: [field], message })
  }
})
const idParams = z.object({ id: z.string().min(1) })
export const calloutAreasRouter = Router()

// Mounted behind the vet router's authentication and VET role checks.
calloutAreasRouter.get('/', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  sendSuccess(response, await prisma.calloutArea.findMany({ where: { practiceId: practice.id }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }))
})
calloutAreasRouter.post('/', validateBody(calloutAreaSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  sendSuccess(response, await prisma.calloutArea.create({ data: { ...(request.validatedBody as z.infer<typeof calloutAreaSchema>), practiceId: practice.id } }), 'Call-out area created', 201)
})
calloutAreasRouter.put('/:id', validateParams(idParams), validateBody(calloutAreaSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const existing = await prisma.calloutArea.findFirst({ where: { id, practiceId: practice.id }, select: { id: true } })
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Call-out area was not found')
  sendSuccess(response, await prisma.calloutArea.update({ where: { id, practiceId: practice.id }, data: request.validatedBody as z.infer<typeof calloutAreaSchema> }), 'Call-out area updated')
})
calloutAreasRouter.delete('/:id', validateParams(idParams), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const result = await prisma.calloutArea.deleteMany({ where: { id, practiceId: practice.id } })
  if (!result.count) throw new ApiError(404, 'NOT_FOUND', 'Call-out area was not found')
  sendSuccess(response, { deleted: true })
})
