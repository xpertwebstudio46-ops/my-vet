import { Router } from 'express'
import { z } from 'zod'
import { UploadPurpose } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'
import { authenticate } from '../auth/auth.middleware.js'
import { uploadRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { uploadMultiple, uploadSingle } from '../../shared/middleware/upload.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { deleteR2Object, uploadImages } from './upload.service.js'

const purposeSchema = z.enum(UploadPurpose)

async function ownerFor(userId: string, role: string, purpose: UploadPurpose) {
  const practicePurposes: UploadPurpose[] = ['PRACTICE_LOGO', 'PRACTICE_BANNER', 'GALLERY']
  if (practicePurposes.includes(purpose)) {
    if (role !== 'VET') throw new ApiError(403, 'FORBIDDEN', 'This upload purpose requires a vet account')
    const practice = await prisma.practice.findUnique({ where: { ownerId: userId }, select: { id: true } })
    if (!practice) throw new ApiError(404, 'PRACTICE_NOT_FOUND', 'Create a practice before uploading practice media')
    return { userId, practiceId: practice.id }
  }
  if (purpose === 'PET' && role !== 'PET_OWNER') {
    throw new ApiError(403, 'FORBIDDEN', 'Only pet owners may upload pet images')
  }
  if (purpose === 'BLOG' || purpose === 'SPONSORSHIP') {
    if (role !== 'ADMIN') throw new ApiError(403, 'FORBIDDEN', 'This upload purpose requires an admin account')
  }
  return { userId }
}

function parsePurpose(value: unknown) {
  const result = purposeSchema.safeParse(typeof value === 'string' ? value.toUpperCase() : value)
  if (!result.success) throw new ApiError(400, 'INVALID_UPLOAD_PURPOSE', 'Upload purpose is invalid')
  return result.data
}

export const uploadRouter = Router()
uploadRouter.use(authenticate, uploadRateLimiter)

uploadRouter.post('/image', uploadSingle, async (request, response) => {
  if (!request.file) throw new ApiError(400, 'IMAGE_REQUIRED', 'An image is required')
  const purpose = parsePurpose(request.body.purpose)
  const owner = await ownerFor(request.user!.userId, request.user!.role, purpose)
  const [asset] = await uploadImages([request.file], purpose, owner)
  sendSuccess(response, asset, 'Image uploaded', 201)
})

uploadRouter.post('/images', uploadMultiple, async (request, response) => {
  const files = Array.isArray(request.files) ? request.files : []
  const purpose = parsePurpose(request.body.purpose)
  const owner = await ownerFor(request.user!.userId, request.user!.role, purpose)
  const assets = await uploadImages(files, purpose, owner)
  sendSuccess(response, assets, 'Images uploaded', 201)
})

uploadRouter.delete('/*key', async (request, response) => {
  const raw = request.params.key
  const key = Array.isArray(raw) ? raw.join('/') : raw
  if (!key || key.includes('..')) throw new ApiError(400, 'INVALID_ASSET_KEY', 'Asset key is invalid')
  const asset = await prisma.uploadedAsset.findUnique({
    where: { key },
    include: { galleryMedia: true, practice: { select: { ownerId: true } }, _count: { select: { petImages: true } } },
  })
  if (!asset) throw new ApiError(404, 'ASSET_NOT_FOUND', 'Asset was not found')
  const ownedByUser = asset.ownerUserId === request.user!.userId
  const ownedPractice = asset.practice?.ownerId === request.user!.userId
  if (!ownedByUser && !ownedPractice) throw new ApiError(403, 'FORBIDDEN', 'You do not own this asset')
  if (asset.galleryMedia || asset._count.petImages) {
    throw new ApiError(409, 'ASSET_IN_USE', 'Detach this asset before deleting it')
  }
  await deleteR2Object(asset.key)
  await prisma.uploadedAsset.delete({ where: { id: asset.id } })
  sendSuccess(response, { deleted: true }, 'Asset deleted')
})
