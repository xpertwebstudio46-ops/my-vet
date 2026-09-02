'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Facility = {
  id: string
  name: string
  description: string | null
  active: boolean
}

type FacilityInput = {
  name: string
  description: string | null
  active: boolean
}

function sortFacilities(items: Facility[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name))
}

function FacilityFormModal({
  item,
  onClose,
  onSave,
}: {
  item: Facility | null
  onClose: () => void
  onSave: (input: FacilityInput) => Promise<void>
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [active, setActive] = useState(item?.active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        active,
      })
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Facility could not be saved.')
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Edit facility' : 'Add facility'} className="max-w-xl">
      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4">
        <label className="block text-sm font-medium text-black">
          Facility name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD]"
            maxLength={150}
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
            maxLength={2000}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-black">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 accent-[#01AEAD]"
          />
          Show on listing
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
            {saving ? 'Saving...' : item ? 'Save changes' : 'Add facility'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function VetFacilitiesPage() {
  const [items, setItems] = useState<Facility[]>([])
  const [editing, setEditing] = useState<Facility | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Facility[]>('/api/vet/facilities')
      .then((loaded) => setItems(sortFacilities(loaded)))
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Facilities could not be loaded.'))
  }, [])

  async function save(input: FacilityInput) {
    const saved = await apiClient<Facility>(editing ? `/api/vet/facilities/${editing.id}` : '/api/vet/facilities', {
      method: editing ? 'PUT' : 'POST',
      body: JSON.stringify(input),
    })

    setItems((current) => {
      const next = editing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved]
      return sortFacilities(next)
    })
    setEditing(null)
    setFormOpen(false)
  }

  async function toggle(item: Facility) {
    try {
      const saved = await apiClient<Facility>(`/api/vet/facilities/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !item.active }),
      })
      setItems((current) => sortFacilities(current.map((value) => (value.id === item.id ? saved : value))))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Facility could not be updated.')
    }
  }

  async function remove(item: Facility) {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      await apiClient(`/api/vet/facilities/${item.id}`, { method: 'DELETE' })
      setItems((current) => current.filter((value) => value.id !== item.id))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Facility could not be deleted.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Facilities" description="Facilities available at your practice.">
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
        >
          <Plus className="size-4" />
          Add facility
        </button>
      </PageHeader>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-black">{item.name}</h2>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.description || 'No description'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
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
                  onClick={() => void remove(item)}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-red-100 text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={() => void toggle(item)}
                className="size-4 accent-[#01AEAD]"
              />
              Show on listing
            </label>
          </div>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No facilities added.</p>}
      </Card>

      {formOpen && (
        <FacilityFormModal
          item={editing}
          onClose={() => {
            setEditing(null)
            setFormOpen(false)
          }}
          onSave={save}
        />
      )}
    </div>
  )
}
