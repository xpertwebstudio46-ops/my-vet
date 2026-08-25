'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Heart, Search, Trash2 } from 'lucide-react'
import { EmptyState } from './feedback'
import { PracticeCard, type PracticeCardItem } from './practice-card'
import { Card, PageHeader } from './ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Practice } from '@/lib/api/types'

export function SavedPracticesList({ mode }: { mode: 'favourites' | 'saved' }) {
  const [items, setItems] = useState<Practice[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Practice[]>('/api/practices/saved')
      .then(setItems)
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Saved practices could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return term ? items.filter((item) => `${item.name} ${item.city} ${item.description ?? ''}`.toLowerCase().includes(term)) : items
  }, [items, query])

  async function remove(practice: Practice) {
    try {
      const result = await apiClient<{ saved: boolean }>(`/api/practices/${practice.id}/save`, { method: 'POST' })
      if (!result.saved) setItems((current) => current.filter((item) => item.id !== practice.id))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'The practice could not be removed.')
    }
  }

  const title = mode === 'favourites' ? 'My Favourite Vets' : 'Saved veterinary practices'
  const description = mode === 'favourites' ? 'Practices you have saved for quick access.' : 'Your live shortlist of veterinary practices.'
  const Icon = mode === 'favourites' ? Heart : Bookmark

  return <div>
    <PageHeader title={title} description={description}><Link href="/find-a-vet" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white"><Search className="size-4" />Find a vet</Link></PageHeader>
    <Card className="mb-6 p-3"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter saved practices" className="h-11 w-full rounded-lg border bg-white pl-9 pr-4 text-sm outline-none focus:border-[#01AEAD]" /></div></Card>
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <Card className="p-8 text-center text-sm text-muted-foreground">Loading saved practices...</Card> : visible.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((practice) => <div key={practice.id} className="relative"><PracticeCard practice={toCard(practice)} favourited /><button type="button" onClick={() => void remove(practice)} className="absolute bottom-4 left-4 z-10 inline-flex h-9 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-semibold text-red-600 shadow-sm"><Trash2 className="size-3.5" />Remove</button></div>)}</div> : <EmptyState icon={Icon} title={query ? 'No matching practices' : 'No saved practices yet'} description={query ? 'Try another search term.' : 'Save an approved practice from the dashboard or directory and it will appear here.'} action={<Link href="/find-a-vet" className="rounded-lg bg-[#064071] px-4 py-2 text-sm font-semibold text-white">Browse practices</Link>} />}
  </div>
}

function toCard(practice: Practice): PracticeCardItem {
  return {
    id: practice.id,
    slug: practice.slug,
    name: practice.name,
    image: practice.bannerUrl || practice.logoUrl || '/placeholder.svg',
    location: [practice.city, practice.county].filter(Boolean).join(', '),
    distance: practice.postcode,
    rating: Number(practice.rating),
    reviews: practice.reviewCount,
    tags: [...(practice.animalTypes?.map(({ animalType }) => animalType.name) ?? []), ...(practice.services?.map((service) => service.name) ?? [])].slice(0, 5),
    description: practice.description || 'View the practice profile for services and booking information.',
  }
}
