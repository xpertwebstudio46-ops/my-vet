import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateBody, validateParams } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { deleteUploadedAsset, markUploadAttached, requireUploadForAttachment } from '../upload/asset-attachment.service.js'

const petSchema = z.object({
  name: z.string().trim().min(1).max(80),
  species: z.string().trim().min(1).max(80),
  animalTypeId: z.string().min(1).nullable().optional(),
  imageAssetId: z.string().min(1).nullable().optional(),
  breed: z.string().trim().max(100).nullable().optional(),
  sex: z.string().trim().max(30).nullable().optional(),
  dateOfBirth: z.coerce.date().max(new Date()).nullable().optional(),
  weightKg: z.coerce.number().positive().max(1_000).nullable().optional(),
  microchip: z.string().trim().max(80).nullable().optional(),
  notes: z.string().trim().max(2_000).nullable().optional(),
})
const updatePetSchema = petSchema.partial()
const idParams = z.object({ id: z.string().min(1) })

async function validateReferences(userId: string, body: z.infer<typeof updatePetSchema>) {
  if (body.animalTypeId) {
    const animalType = await prisma.animalType.count({ where: { id: body.animalTypeId, active: true } })
    if (!animalType) throw new ApiError(400, 'INVALID_ANIMAL_TYPE', 'Animal type is not active')
  }
  return body.imageAssetId
    ? requireUploadForAttachment(body.imageAssetId, 'PET', { ownerUserId: userId })
    : null
}

export const petsRouter = Router()
petsRouter.use(authenticate, requireRole('PET_OWNER'))

petsRouter.get('/', async (request, response) => {
  const pets = await prisma.pet.findMany({
    where: { userId: request.user!.userId },
    include: { imageAsset: { select: { id: true, url: true } } },
    orderBy: { createdAt: 'desc' },
  })
  sendSuccess(response, pets)
})

petsRouter.post('/', validateBody(petSchema), async (request, response) => {
  const body = request.validatedBody as z.infer<typeof petSchema>
  const asset = await validateReferences(request.user!.userId, body)
  const pet = await prisma.$transaction(async (transaction) => {
    const created = await transaction.pet.create({
      data: { ...body, userId: request.user!.userId },
      include: { imageAsset: { select: { id: true, url: true } } },
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return created
  })
  sendSuccess(response, pet, 'Pet added', 201)
})

petsRouter.put('/:id', validateParams(idParams), validateBody(updatePetSchema), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const body = request.validatedBody as z.infer<typeof updatePetSchema>
  const pet = await prisma.pet.findFirst({
    where: { id, userId: request.user!.userId },
    select: { id: true, imageAsset: { select: { id: true, key: true } } },
  })
  if (!pet) throw new ApiError(404, 'PET_NOT_FOUND', 'Pet was not found')
  const asset = await validateReferences(request.user!.userId, body)
  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.pet.update({
      where: { id },
      data: body,
      include: { imageAsset: { select: { id: true, url: true } } },
    })
    if (asset) await markUploadAttached(transaction, asset.id)
    return result
  })
  if (body.imageAssetId !== undefined && pet.imageAsset && pet.imageAsset.id !== updated.imageAssetId) {
    await deleteUploadedAsset(pet.imageAsset).catch(() => undefined)
  }
  sendSuccess(response, updated, 'Pet updated')
})

petsRouter.delete('/:id', validateParams(idParams), async (request, response) => {
  const { id } = request.validatedParams as z.infer<typeof idParams>
  const pet = await prisma.pet.findFirst({
    where: { id, userId: request.user!.userId },
    select: { id: true, imageAsset: { select: { id: true, key: true } } },
  })
  if (!pet) throw new ApiError(404, 'PET_NOT_FOUND', 'Pet was not found')
  const future = await prisma.appointment.count({
    where: { petId: id, date: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] } },
  })
  if (future) throw new ApiError(409, 'PET_HAS_UPCOMING_APPOINTMENTS', 'Cancel upcoming appointments before deleting this pet')
  await prisma.pet.delete({ where: { id } })
  if (pet.imageAsset) await deleteUploadedAsset(pet.imageAsset).catch(() => undefined)
  sendSuccess(response, { deleted: true }, 'Pet deleted')
})
