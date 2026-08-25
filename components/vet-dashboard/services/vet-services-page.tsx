'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Category = { id: string; name: string; description: string | null; imageUrl: string | null }
type Service = { id: string; categoryId: string | null; name: string; description: string | null; price: string | null; currency: string; active: boolean; sortOrder: number }
type Draft = { categoryId: string; name: string; description: string; price: string }
const emptyDraft: Draft = { categoryId: '', name: '', description: '', price: '' }

export function VetServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void Promise.all([apiClient<Service[]>('/api/vet/services'), apiClient<Category[]>('/api/vet/service-categories')])
      .then(([services, availableCategories]) => { setItems(services); setCategories(availableCategories) })
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Services could not be loaded.'))
  }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault(); setError('')
    try {
      const item = await apiClient<Service>(editing ? `/api/vet/services/${editing.id}` : '/api/vet/services', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ categoryId: draft.categoryId || null, name: draft.name, description: draft.description || null, price: draft.price ? Number(draft.price) : null, currency: 'GBP', ...(editing ? {} : { active: true, sortOrder: items.length }) }),
      })
      setItems((current) => editing ? current.map((value) => value.id === item.id ? item : value) : [...current, item])
      setEditing(null); setDraft(emptyDraft)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Service could not be saved.') }
  }

  function beginEdit(item: Service) {
    setEditing(item)
    setDraft({ categoryId: item.categoryId ?? '', name: item.name, description: item.description ?? '', price: item.price ?? '' })
  }

  async function update(item: Service, data: Partial<Service>) {
    try {
      const saved = await apiClient<Service>(`/api/vet/services/${item.id}`, { method: 'PUT', body: JSON.stringify(data) })
      setItems((current) => current.map((value) => value.id === item.id ? saved : value))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Service could not be updated.') }
  }

  async function remove() {
    if (!deleting) return
    try {
      await apiClient(`/api/vet/services/${deleting.id}`, { method: 'DELETE' })
      setItems((current) => current.filter((value) => value.id !== deleting.id)); setDeleting(null)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Service could not be deleted.') }
  }

  const form = <form onSubmit={(event) => void save(event)} className="grid gap-3"><label className="text-sm font-medium">Service category<select value={draft.categoryId} onChange={(event) => { const categoryId = event.target.value; const category = categories.find((item) => item.id === categoryId); setDraft({ ...draft, categoryId, ...(!draft.name && category ? { name: category.name, description: category.description ?? '' } : {}) }) }} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Custom / uncategorised</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-medium">Service name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><label className="text-sm font-medium">Description<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><label className="text-sm font-medium">Price (GBP)<input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditing(null); setDraft(emptyDraft) }} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white"><Plus className="size-4" />{editing ? 'Save service' : 'Add service'}</button></div></form>

  return <div className="space-y-6"><div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-lg"><div><h1 className="dashboard-heading text-5xl">Services</h1><p className="text-sm text-muted-foreground">Services displayed on your public listing. Categories created by the administrator are available below.</p></div></div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{!editing && <Card className="p-5"><h2 className="mb-4 font-semibold">Add a service</h2>{!categories.length && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No active service categories are available yet. You can still add a custom service.</p>}{form}</Card>}<Card className="overflow-hidden p-0">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center"><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.name}</p>{item.categoryId && <span className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700">{categories.find((category) => category.id === item.categoryId)?.name ?? 'Category'}</span>}</div><p className="text-sm text-muted-foreground">{item.description || 'No description'}{item.price ? ` — ${item.currency} ${item.price}` : ''}</p></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.active} onChange={(event) => void update(item, { active: event.target.checked })} />Visible</label><button type="button" onClick={() => beginEdit(item)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"><Pencil className="size-4" />Edit</button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)} className="rounded-md p-2 text-red-600"><Trash2 className="size-4" /></button></div>)}{!items.length && <p className="p-8 text-center text-sm text-muted-foreground">No services added.</p>}</Card>{editing && <Modal open onClose={() => { setEditing(null); setDraft(emptyDraft) }} title={`Edit ${editing.name}`} className="max-w-xl">{form}</Modal>}{deleting && <Modal open onClose={() => setDeleting(null)} title={`Delete ${deleting.name}?`} description="This service will be removed from your public listing."><div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleting(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void remove()} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">Delete service</button></div></Modal>}</div>
}
