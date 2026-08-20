'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { ApiClientError } from '@/lib/api/client'
import type { CategoryCardItem, CategoryInput } from './category-card'

export function CategoryFormModal({ title, item, defaultImage, submitLabel = 'Save category', onClose, onSave }: { title: string; item?: CategoryCardItem | null; defaultImage: string; submitLabel?: string; onClose: () => void; onSave: (input: CategoryInput) => Promise<void> }) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [file, setFile] = useState<File>()
  const [imagePreview, setImagePreview] = useState(item?.imageUrl ?? defaultImage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true); setError('')
    try { await onSave({ name: name.trim(), description: description.trim() || null, active: item?.active ?? true, file }) }
    catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Category could not be saved.'); setSaving(false) }
  }

  return (
    <Modal open onClose={onClose} title={title} className="max-w-xl">
      <div className="grid gap-4">
        <label className="block text-sm font-medium text-black">Category name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD]" /></label>
        <label className="block text-sm font-medium text-black">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD]" /></label>
        <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100"><Image src={imagePreview} alt="Category preview" fill sizes="64px" unoptimized={imagePreview.startsWith('blob:')} className="object-cover" /></span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]"><ImagePlus className="size-4 text-[#01AEAD]" />Upload image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) { setFile(selected); setImagePreview(URL.createObjectURL(selected)) } }} />
        </label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071]">Cancel</button><button type="button" onClick={() => void handleSave()} disabled={saving} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Savingâ€¦' : submitLabel}</button></div>
    </Modal>
  )
}
