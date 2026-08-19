import { randomUUID } from 'node:crypto'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import type { UploadPurpose } from '../../generated/prisma/enums.js'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { getR2 } from '../../config/cloudflare.js'
import { ApiError } from '../../shared/utils/api-error.js'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function detectImage(buffer: Buffer) {
  const detected = await fileTypeFromBuffer(buffer)
  if (!detected || !allowedMimeTypes.has(detected.mime)) {
    throw new ApiError(415, 'UNSUPPORTED_IMAGE', 'Only JPEG, PNG, WebP, and GIF images are accepted')
  }
  try {
    const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata()
    if (!metadata.width || !metadata.height || metadata.width > 10_000 || metadata.height > 10_000) {
      throw new ApiError(400, 'INVALID_IMAGE_DIMENSIONS', 'Image dimensions are missing or too large')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(415, 'INVALID_IMAGE_DATA', 'Image data could not be decoded')
  }
  return detected
}

export async function deleteR2Object(key: string) {
  if (!env.CLOUDFLARE_R2_BUCKET) throw new ApiError(503, 'UPLOADS_NOT_CONFIGURED', 'File uploads are not configured')
  await getR2().send(new DeleteObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET, Key: key }))
}

export interface UploadOwner {
  userId: string
  practiceId?: string
}

export async function uploadImages(files: Express.Multer.File[], purpose: UploadPurpose, owner: UploadOwner) {
  if (!files.length) throw new ApiError(400, 'IMAGE_REQUIRED', 'At least one image is required')
  if (!env.CLOUDFLARE_R2_BUCKET || !env.CLOUDFLARE_CDN_URL) {
    throw new ApiError(503, 'UPLOADS_NOT_CONFIGURED', 'File uploads are not configured')
  }

  const uploaded: Array<{ key: string; url: string; mimeType: string; size: number }> = []
  try {
    for (const file of files) {
      const type = await detectImage(file.buffer)
      const namespace = owner.practiceId ? `practices/${owner.practiceId}` : `users/${owner.userId}`
      const key = `${namespace}/${purpose.toLowerCase()}/${randomUUID()}.${type.ext}`
      await getR2().send(
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: type.mime,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )
      uploaded.push({
        key,
        url: `${env.CLOUDFLARE_CDN_URL.replace(/\/$/, '')}/${key}`,
        mimeType: type.mime,
        size: file.size,
      })
    }

    return await prisma.$transaction(
      uploaded.map((file) =>
        prisma.uploadedAsset.create({
          data: {
            ...file,
            purpose,
            ownerUserId: owner.userId,
            ...(owner.practiceId ? { practiceId: owner.practiceId } : {}),
          },
        }),
      ),
    )
  } catch (error) {
    await Promise.allSettled(uploaded.map((file) => deleteR2Object(file.key)))
    throw error
  }
}
