'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { GalleryItem } from './gallery-types'

type GalleryMediaModalProps = {
  item?: GalleryItem | null
  onClose: () => void
  onSave: (input: { title: string; file?: File }) => Promise<void>
}

export function GalleryMediaModal({ item, onClose, onSave }: GalleryMediaModalProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState(item?.image ?? '/images/practice-1.png')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function chooseImage(nextFile?: File) {
    if (!nextFile) return
    if (nextFile.size > 8 * 1024 * 1024) {
      setError('Images must be 8 MB or smaller.')
      return
    }
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    if (!title.trim()) setTitle(nextFile.name.replace(/\.[^/.]+$/, ''))
    setError('')
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Enter a gallery title.')
      return
    }
    if (!item && !file) {
      setError('Choose an image to upload.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ title: title.trim(), ...(file ? { file } : {}) })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Edit gallery image' : 'Upload gallery image'} className="max-w-2xl">
      <div className="grid gap-4">
        <label className="block text-sm font-medium text-black">
          Gallery title
          <input type="text" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15" />
        </label>
        {!item && (
          <div>
            <p className="text-sm font-medium text-black">Image</p>
            <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
              <span className="relative size-20 overflow-hidden rounded-md bg-slate-100">
                <Image src={preview} alt="Gallery preview" fill sizes="80px" unoptimized={preview.startsWith('blob:')} className="object-cover" />
              </span>
              <span><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]"><ImagePlus className="size-4 text-[#01AEAD]" />Choose image</span><span className="mt-1 block text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · max 8 MB</span></span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} />
            </label>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50">Cancel</button>
        <button type="button" disabled={saving} onClick={() => void handleSave()} className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594] disabled:opacity-60">{saving ? 'Saving…' : 'Save image'}</button>
      </div>
    </Modal>
  )
}
