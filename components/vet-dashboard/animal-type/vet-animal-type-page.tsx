'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type AnimalType = { id: string; name: string; description: string | null; imageUrl: string | null; selected: boolean }

export function VetAnimalTypePage() {
  const [items, setItems] = useState<AnimalType[]>([]); const [error, setError] = useState('')
  useEffect(() => { void apiClient<AnimalType[]>('/api/vet/animal-types').then(setItems).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Animal types could not be loaded.')) }, [])
  async function toggle(item: AnimalType) { try { const result = await apiClient<{ selected: boolean }>(`/api/vet/animal-types/${item.id}/toggle`, { method: 'POST' }); setItems((current) => current.map((value) => value.id === item.id ? { ...value, selected: result.selected } : value)) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Animal type could not be updated.') } }
  return <div className="space-y-6"><div className="rounded-2xl bg-white p-5 shadow-lg"><h1 className="dashboard-heading text-5xl">Animal types</h1><p className="text-sm text-muted-foreground">Select the animals your practice treats. Changes save immediately.</p></div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<Card className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <button key={item.id} onClick={() => void toggle(item)} className={`flex items-center gap-4 rounded-xl border p-4 text-left ${item.selected ? 'border-[#01AEAD] bg-teal-50' : 'border-slate-200 bg-white'}`}><span className="relative size-14 overflow-hidden rounded-lg bg-slate-100"><Image src={item.imageUrl || '/placeholder.svg'} alt="" fill sizes="56px" className="object-cover" /></span><span className="min-w-0 flex-1"><strong className="block">{item.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.selected ? 'Shown on your listing' : 'Not selected'}</span></span><input type="checkbox" readOnly checked={item.selected} /></button>)}</Card></div>
}
