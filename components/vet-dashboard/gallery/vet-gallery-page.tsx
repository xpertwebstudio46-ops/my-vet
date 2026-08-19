'use client'

import { useMemo, useState } from 'react'
import { ConfirmDeleteModal } from '../team-members/confirm-delete-modal'
import { GalleryBanner } from './gallery-banner'
import { GalleryMediaCard } from './gallery-media-card'
import { GalleryMediaModal } from './gallery-media-modal'
import { GalleryTabs } from './gallery-tabs'
import { UploadMediaCard } from './upload-media-card'
import type { GalleryItem, GalleryTab } from './gallery-types'

const initialItems: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: 'Main consulting room',
    image: '/images/practice-1.png',
    type: 'photo',
  },
  {
    id: 'gallery-2',
    title: 'Reception & waiting area',
    image: '/images/practice-2.png',
    type: 'photo',
  },
  {
    id: 'gallery-3',
    title: 'Clinic tour (2:14)',
    image: '/images/practice-3.png',
    type: 'video',
  },
  {
    id: 'gallery-4',
    title: 'Surgery preparation suite',
    image: '/images/about-hero.png',
    type: 'photo',
  },
  {
    id: 'gallery-5',
    title: 'Meet the nursing team',
    image: '/images/vet-1.png',
    type: 'video',
  },
]

export function VetGalleryPage() {
  const [items, setItems] = useState(initialItems)
  const [activeTab, setActiveTab] = useState<GalleryTab>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState<GalleryItem | null>(null)

  const counts = useMemo(
    () => ({
      all: items.length,
      photo: items.filter((item) => item.type === 'photo').length,
      video: items.filter((item) => item.type === 'video').length,
    }),
    [items],
  )

  const visibleItems =
    activeTab === 'all'
      ? items
      : items.filter((item) => item.type === activeTab)

  function saveMedia(item: GalleryItem) {
    setItems((current) => {
      const exists = current.some((media) => media.id === item.id)
      return exists
        ? current.map((media) => (media.id === item.id ? item : media))
        : [item, ...current]
    })
    setEditing(null)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <GalleryBanner
        onUpload={() => {
          setEditing(null)
          setModalOpen(true)
        }}
      />

      <GalleryTabs
        activeTab={activeTab}
        counts={counts}
        onChange={setActiveTab}
      />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <UploadMediaCard
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        />

        {visibleItems.map((item) => (
          <GalleryMediaCard
            key={item.id}
            item={item}
            onEdit={() => {
              setEditing(item)
              setModalOpen(true)
            }}
            onDelete={() => setDeleting(item)}
          />
        ))}
      </div>

      {modalOpen && (
        <GalleryMediaModal
          item={editing}
          onClose={() => {
            setEditing(null)
            setModalOpen(false)
          }}
          onSave={saveMedia}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          title="Delete media?"
          description={`This will remove ${deleting.title} from your gallery.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setItems((current) =>
              current.filter((item) => item.id !== deleting.id),
            )
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
