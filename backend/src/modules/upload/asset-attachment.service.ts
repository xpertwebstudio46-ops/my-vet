import type { Prisma, UploadPurpose } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { deleteR2Object } from './upload.service.js'

export interface AssetOwner {
  ownerUserId?: string
  practiceId?: string
}

export async function requireUploadForAttachment(
  assetId: string,
  purpose: UploadPurpose,
  owner: AssetOwner,
) {
  const asset = await prisma.uploadedAsset.findFirst({
    where: {
      id: assetId,
      purpose,
      attachedAt: null,
      ...(owner.ownerUserId ? { ownerUserId: owner.ownerUserId } : {}),
      ...(owner.practiceId ? { practiceId: owner.practiceId } : {}),
    },
  })
  if (!asset) throw new ApiError(400, 'INVALID_UPLOAD_ASSET', 'The uploaded image is invalid, already attached, or not owned by this account')
  return asset
}

export function markUploadAttached(transaction: Prisma.TransactionClient, assetId: string) {
  return transaction.uploadedAsset.update({ where: { id: assetId }, data: { attachedAt: new Date() } })
}

export async function deleteUploadedAssetByUrl(
  url: string | null | undefined,
  purposes: UploadPurpose[],
  owner: AssetOwner,
) {
  if (!url) return
  const asset = await prisma.uploadedAsset.findFirst({
    where: {
      url,
      purpose: { in: purposes },
      ...(owner.ownerUserId ? { ownerUserId: owner.ownerUserId } : {}),
      ...(owner.practiceId ? { practiceId: owner.practiceId } : {}),
    },
  })
  if (!asset) return
  await deleteR2Object(asset.key)
  await prisma.uploadedAsset.delete({ where: { id: asset.id } })
}

export async function deleteUploadedAsset(asset: { id: string; key: string }) {
  await deleteR2Object(asset.key)
  await prisma.uploadedAsset.delete({ where: { id: asset.id } })
}
