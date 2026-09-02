'use client'

import Image from 'next/image'
import { Check, ImagePlus, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'

type AnimalType = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  selected: boolean
}

type AnimalTypeInput = {
  name: string
  description: string | null
  file?: File
}

function sortAnimalTypes(items: AnimalType[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name))
}

function AnimalTypeFormModal({
  item,
  onClose,
  onSave,
}: {
  item: AnimalType | null
  onClose: () => void
  onSave: (input: AnimalTypeInput) => Promise<void>
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [file, setFile] = useState<File>()
  const [imagePreview, setImagePreview] = useState(item?.imageUrl ?? '/images/pet.png')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function chooseImage(selected: File | undefined) {
    if (!selected) return
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setFile(selected)
    setImagePreview(URL.createObjectURL(selected))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    setSaving(true)
    setError('')
    try {
      await onSave({
        name: trimmedName,
        description: description.trim() || null,
        file,
      })
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Animal type could not be saved.')
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Edit animal type' : 'Add animal type'} className="max-w-xl">
      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4">
        <label className="block text-sm font-medium text-black">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD]"
            maxLength={100}
            required
          />
        </label>

        <label className="block text-sm font-medium text-black">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD]"
            maxLength={1000}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
            <Image
              src={imagePreview}
              alt=""
              fill
              sizes="64px"
              unoptimized={imagePreview.startsWith('blob:')}
              className="object-cover"
            />
          </span>
          <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#064071]">
            <ImagePlus className="size-4 shrink-0 text-[#01AEAD]" />
            <span className="truncate">{file ? file.name : 'Upload image'}</span>
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => chooseImage(event.target.files?.[0])}
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#018f8e] disabled:opacity-60"
          >
            {saving ? 'Saving...' : item ? 'Save changes' : 'Add type'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function VetAnimalTypePage() {
  const [items, setItems] = useState<AnimalType[]>([])
  const [editing, setEditing] = useState<AnimalType | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<AnimalType[]>('/api/vet/animal-types')
      .then((loaded) => setItems(sortAnimalTypes(loaded)))
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Animal types could not be loaded.'))
  }, [])

  async function toggle(item: AnimalType) {
    try {
      const result = await apiClient<{ selected: boolean }>(`/api/vet/animal-types/${item.id}/toggle`, { method: 'POST' })
      setItems((current) => current.map((value) => (value.id === item.id ? { ...value, selected: result.selected } : value)))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Animal type could not be updated.')
    }
  }

  async function saveAnimalType(input: AnimalTypeInput) {
    const asset = input.file ? await uploadImage(input.file, 'TAXONOMY') : null
    let saved: AnimalType
    try {
      saved = await apiClient<AnimalType>(editing ? `/api/vet/animal-types/${editing.id}` : '/api/vet/animal-types', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          ...(asset ? { imageAssetId: asset.id } : {}),
        }),
      })
    } catch (caught) {
      if (asset) await discardUpload(asset)
      throw caught
    }

    setItems((current) => {
      const next = editing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved]
      return sortAnimalTypes(next)
    })
    setEditing(null)
    setFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Animal types" description="Select the animals your practice treats. Add or edit animal types when you need more options.">
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
        >
          <Plus className="size-4" />
          Add type
        </button>
      </PageHeader>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex min-h-28 items-start gap-4 rounded-xl border p-4 ${
              item.selected ? 'border-[#01AEAD] bg-teal-50' : 'border-slate-200 bg-white'
            }`}
          >
            <button type="button" onClick={() => void toggle(item)} className="flex min-w-0 flex-1 items-start gap-4 text-left">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image src={item.imageUrl || '/images/pet.png'} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-black">{item.name}</strong>
                <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                  {item.description || (item.selected ? 'Shown on your listing' : 'Not selected')}
                </span>
              </span>
            </button>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(item)
                  setFormOpen(true)
                }}
                className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 text-[#064071] hover:border-[#01AEAD] hover:bg-[#EEF7F5]"
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void toggle(item)}
                className={`inline-flex size-8 items-center justify-center rounded-full border ${
                  item.selected ? 'border-[#01AEAD] bg-[#01AEAD] text-white' : 'border-gray-200 bg-white text-transparent'
                }`}
                aria-label={item.selected ? `Unselect ${item.name}` : `Select ${item.name}`}
              >
                <Check className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </Card>

      {formOpen && (
        <AnimalTypeFormModal
          item={editing}
          onClose={() => {
            setEditing(null)
            setFormOpen(false)
          }}
          onSave={saveAnimalType}
        />
      )}
    </div>
  )
}
