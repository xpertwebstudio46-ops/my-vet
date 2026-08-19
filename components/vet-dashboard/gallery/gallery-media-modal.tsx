'use client'

import Image from 'next/image'
import { ImagePlus, Video } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { GalleryItem, GalleryMediaType } from './gallery-types'

type GalleryMediaModalProps = {
  item?: GalleryItem | null
  onClose: () => void
  onSave: (item: GalleryItem) => void
}

export function GalleryMediaModal({
  item,
  onClose,
  onSave,
}: GalleryMediaModalProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [type, setType] = useState<GalleryMediaType>(item?.type ?? 'photo')
  const [image, setImage] = useState(item?.image ?? '/images/practice-1.png')
  const [videoPath, setVideoPath] = useState(
    item?.type === 'video' ? item.image : '',
  )

  function handleImageChange(file?: File) {
    if (!file) return
    setImage(URL.createObjectURL(file))
  }

  function handleVideoChange(file?: File) {
    if (!file) return
    setVideoPath(URL.createObjectURL(file))
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  function handleSave() {
    const mediaTitle = title.trim() || (type === 'video' ? 'Uploaded video' : '')
    if (!mediaTitle) return

    onSave({
      id: item?.id ?? `gallery-${Date.now()}`,
      title: mediaTitle,
      type,
      image:
        type === 'video'
          ? videoPath.trim() || '/videos/clinic-tour.mp4'
          : image,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? 'Edit media' : 'Upload media'}
      className="max-w-2xl"
    >
      <div className="grid gap-4">
        <GalleryInput label="Gallery name" value={title} onChange={setTitle} />

        <div>
          <p className="text-sm font-medium text-black">Media type</p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {(['photo', 'video'] as GalleryMediaType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${
                  type === option
                    ? 'bg-[#064071] text-white'
                    : 'text-muted-foreground hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {type === 'photo' ? (
          <div>
            <p className="text-sm font-medium text-black">Media image</p>
            <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
              <span className="relative size-20 overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={image}
                  alt="Gallery preview"
                  fill
                  sizes="80px"
                  unoptimized={image.startsWith('blob:')}
                  className="object-cover"
                />
              </span>
              <span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]">
                  <ImagePlus className="size-4 text-[#01AEAD]" />
                  Upload image
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  PNG, JPG or WEBP cover image
                </span>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => handleImageChange(event.target.files?.[0])}
              />
            </label>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-black">Media video</p>
            <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
              <span className="inline-flex size-20 shrink-0 items-center justify-center rounded-md bg-[#064071]/10 text-[#064071]">
                <Video className="size-7" />
              </span>
              <span className="min-w-0">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]">
                  <ImagePlus className="size-4 text-[#01AEAD]" />
                  Upload video
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {videoPath || 'MP4, MOV or WEBM video file'}
                </span>
              </span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="sr-only"
                onChange={(event) => handleVideoChange(event.target.files?.[0])}
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          Save media
        </button>
      </div>
    </Modal>
  )
}

function GalleryInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
