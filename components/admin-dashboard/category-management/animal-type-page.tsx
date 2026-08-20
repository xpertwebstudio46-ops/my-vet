'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import { CategoryCard, type CategoryCardItem, type CategoryInput } from './category-card'
import { CategoryFormModal } from './category-form-modal'

const path = '/api/admin/animal-types'

export function AnimalTypePage() {
  const [items, setItems] = useState<CategoryCardItem[]>([])
  const [editing, setEditing] = useState<CategoryCardItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<CategoryCardItem | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { void apiClient<CategoryCardItem[]>(path).then(setItems).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Animal types could not be loaded.')) }, [])
  async function save(input: CategoryInput) { const asset = input.file ? await uploadImage(input.file, 'TAXONOMY') : null; try { const item = await apiClient<CategoryCardItem>(editing ? `${path}/${editing.id}` : path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ name: input.name, description: input.description, active: input.active, ...(asset ? { imageAssetId: asset.id } : {}) }) }); setItems((current) => editing ? current.map((value) => value.id === item.id ? item : value) : [...current, item]) } catch (caught) { if (asset) await discardUpload(asset); throw caught } setEditing(null); setFormOpen(false) }
  async function updateActive(item: CategoryCardItem) { try { const updated = await apiClient<CategoryCardItem>(`${path}/${item.id}`, { method: 'PUT', body: JSON.stringify({ active: !item.active }) }); setItems((current) => current.map((value) => value.id === updated.id ? updated : value)) } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Animal type could not be updated.') } }
  async function remove(item: CategoryCardItem) { try { await apiClient(`${path}/${item.id}`, { method: 'DELETE' }); setItems((current) => current.filter((value) => value.id !== item.id)) } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Animal type could not be deleted.') } finally { setDeleting(null) } }

  return <div className="space-y-6"><AdminPageBanner title="Animal Type" description="Manage animal categories available across the MY VET directory." action={{ label: 'Add Category', icon: 'plus', tone: 'teal', onClick: () => { setEditing(null); setFormOpen(true) } }} />{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<Card className="overflow-hidden p-0">{items.map((item) => <CategoryCard key={item.id} item={item} onToggle={() => void updateActive(item)} onEdit={() => { setEditing(item); setFormOpen(true) }} onDelete={() => setDeleting(item)} />)}</Card>{formOpen && <CategoryFormModal title={editing ? 'Edit animal category' : 'Add animal category'} item={editing} defaultImage="/images/pet.png" onClose={() => { setEditing(null); setFormOpen(false) }} onSave={save} />}{deleting && <ConfirmDeleteModal title="Delete animal type?" description={`This permanently removes ${deleting.name} and its R2 image.`} onClose={() => setDeleting(null)} onConfirm={() => void remove(deleting)} />}</div>
}
