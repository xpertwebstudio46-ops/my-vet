'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { ConfirmDeleteModal } from '../team-members/confirm-delete-modal'
import { GalleryBanner } from './gallery-banner'
import { GalleryMediaCard } from './gallery-media-card'
import { GalleryMediaModal } from './gallery-media-modal'
import { GalleryTabs } from './gallery-tabs'
import { UploadMediaCard } from './upload-media-card'
import type { GalleryItem, GalleryTab } from './gallery-types'

type UploadedAsset = { id: string; key: string; url: string; mimeType: string; size: number }
type GalleryMedia = {
  id: string
  url: string
  mediaType: 'IMAGE' | 'VIDEO'
  altText: string | null
  caption: string | null
}

function toGalleryItem(media: GalleryMedia): GalleryItem {
  return {
    id: media.id,
    title: media.caption ?? media.altText ?? 'Practice image',
    image: media.url,
    type: media.mediaType === 'VIDEO' ? 'video' : 'photo',
  }
}

function assetDeletePath(key: string) {
  return `/api/upload/${key.split('/').map(encodeURIComponent).join('/')}`
}

export function VetGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState<GalleryTab>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<GalleryMedia[]>('/api/vet/gallery')
      .then((media) => setItems(media.map(toGalleryItem)))
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Gallery images could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(
    () => ({ all: items.length, photo: items.filter((item) => item.type === 'photo').length, video: items.filter((item) => item.type === 'video').length }),
    [items],
  )
  const visibleItems = activeTab === 'all' ? items : items.filter((item) => item.type === activeTab)

  async function saveMedia(input: { title: string; file?: File }) {
    setError('')
    if (editing) {
      const media = await apiClient<GalleryMedia>(`/api/vet/gallery/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({ caption: input.title, altText: input.title }),
      })
      setItems((current) => current.map((item) => (item.id === editing.id ? toGalleryItem(media) : item)))
    } else {
      if (!input.file) throw new Error('Choose an image to upload.')
      const form = new FormData()
      form.set('purpose', 'GALLERY')
      form.set('image', input.file)
      const asset = await apiClient<UploadedAsset>('/api/upload/image', { method: 'POST', body: form })
      try {
        const media = await apiClient<GalleryMedia>('/api/vet/gallery', {
          method: 'POST',
          body: JSON.stringify({ assetId: asset.id, caption: input.title, altText: input.title, sortOrder: items.length }),
        })
        setItems((current) => [...current, toGalleryItem(media)])
      } catch (caught) {
        await apiClient(assetDeletePath(asset.key), { method: 'DELETE' }).catch(() => undefined)
        throw caught
      }
    }
    setEditing(null)
    setModalOpen(false)
  }

  async function deleteMedia(item: GalleryItem) {
    setError('')
    try {
      await apiClient(`/api/vet/gallery/${item.id}`, { method: 'DELETE' })
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
      setDeleting(null)
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'The image could not be deleted.')
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <GalleryBanner onUpload={() => { setEditing(null); setModalOpen(true) }} />
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <GalleryTabs activeTab={activeTab} counts={counts} onChange={setActiveTab} />
      {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading gallery…</p> : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <UploadMediaCard onClick={() => { setEditing(null); setModalOpen(true) }} />
          {visibleItems.map((item) => <GalleryMediaCard key={item.id} item={item} onEdit={() => { setEditing(item); setModalOpen(true) }} onDelete={() => setDeleting(item)} />)}
        </div>
      )}
      {modalOpen && <GalleryMediaModal item={editing} onClose={() => { setEditing(null); setModalOpen(false) }} onSave={saveMedia} />}
      {deleting && <ConfirmDeleteModal title="Delete image?" description={`This permanently removes ${deleting.title} from the gallery and R2.`} onClose={() => setDeleting(null)} onConfirm={() => void deleteMedia(deleting)} />}
    </div>
  )
}
