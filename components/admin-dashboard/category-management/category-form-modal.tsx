'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { CategoryCardItem } from './category-card'

type CategoryFormModalProps = {
  title: string
  defaultImage: string
  showCount?: boolean
  countLabel?: string
  submitLabel?: string
  onClose: () => void
  onAdd: (item: CategoryCardItem) => void
}

export function CategoryFormModal({
  title,
  defaultImage,
  showCount = false,
  countLabel = 'Practice count',
  submitLabel = 'Add category',
  onClose,
  onAdd,
}: CategoryFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imagePreview, setImagePreview] = useState(defaultImage)
  const [count, setCount] = useState('0')

  function handleImageChange(file?: File) {
    if (!file) return

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImagePreview(URL.createObjectURL(file))
  }

  function handleAdd() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    onAdd({
      id: `${trimmedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: trimmedName,
      description: description.trim() || 'New category description.',
      image: imagePreview,
      active: true,
      count: showCount ? Number(count) || 0 : undefined,
    })
  }

  return (
    <Modal open onClose={onClose} title={title} className="max-w-xl">
      <div className="grid gap-4">
        <label className="block text-sm font-medium text-black">
          Category name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Dogs"
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>

        <label className="block text-sm font-medium text-black">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="894 practices treat this animal."
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>

        <div>
          <p className="text-sm font-medium text-black">Image</p>
          <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 transition-colors hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={imagePreview}
                alt="Category preview"
                fill
                sizes="64px"
                unoptimized={imagePreview.startsWith('blob:')}
                className="object-cover"
              />
            </span>
            <span className="inline-flex min-w-0 flex-col">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]">
                <ImagePlus className="size-4 text-[#01AEAD]" />
                Upload image
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG or WEBP image file
              </span>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) =>
                handleImageChange(event.target.files?.[0])
              }
            />
          </label>
        </div>

        {showCount && (
          <label className="block text-sm font-medium text-black">
            {countLabel}
            <input
              type="number"
              min="0"
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
            />
          </label>
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
          onClick={handleAdd}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          {submitLabel}
        </button>
      </div>
    </Modal>
  )
}
