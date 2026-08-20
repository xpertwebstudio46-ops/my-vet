import { apiClient } from './client'

export type UploadPurpose =
  | 'AVATAR'
  | 'PET'
  | 'PRACTICE_LOGO'
  | 'PRACTICE_BANNER'
  | 'TEAM_MEMBER'
  | 'GALLERY'
  | 'BLOG'
  | 'SPONSORSHIP'
  | 'TAXONOMY'

export type UploadedAsset = {
  id: string
  key: string
  url: string
  mimeType: string
  size: number
}

export async function uploadImage(file: File, purpose: UploadPurpose) {
  const form = new FormData()
  form.set('purpose', purpose)
  form.set('image', file)
  return apiClient<UploadedAsset>('/api/upload/image', { method: 'POST', body: form })
}

export function assetDeletePath(key: string) {
  return `/api/upload/${key.split('/').map(encodeURIComponent).join('/')}`
}

export async function discardUpload(asset: UploadedAsset) {
  await apiClient(assetDeletePath(asset.key), { method: 'DELETE' }).catch(() => undefined)
}
