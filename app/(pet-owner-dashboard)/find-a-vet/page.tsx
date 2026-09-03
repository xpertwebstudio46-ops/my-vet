'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/feedback'
import { PracticeCard, type PracticeCardItem } from '@/components/dashboard/practice-card'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated, Practice, PracticeMembershipType } from '@/lib/api/types'

const animalTypes = ['Small Animals', 'Cats', 'Dogs', 'Equine', 'Farm Animals', 'Exotics']
const services = ['Emergency Care', 'Surgery', 'Dental Care', 'Vaccinations', 'Diagnostics', 'Holistic Care']
const practiceTypes: Array<{ label: string; value: PracticeMembershipType }> = [
  { label: 'Independent Practice', value: 'INDEPENDENT' },
  { label: 'Vet Group', value: 'GROUP' },
]
const pageSize = 12

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
    tags: [
      ...(practice.animalTypes?.map(({ animalType }) => animalType.name) ?? []),
      ...(practice.services?.map((service) => service.name) ?? []),
    ].slice(0, 5),
    description: practice.description || 'View this practice profile for services, opening hours and booking information.',
    membershipType: practice.membershipType,
    branchCount: practice.branchCount,
  }
}

export default function FindAVetPage() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState<PracticeMembershipType[]>([])
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sort, setSort] = useState<'rating' | 'newest' | 'name'>('rating')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<Paginated<Practice> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize), sort })
    if (submittedQuery) params.set('q', submittedQuery)
    if (selectedPracticeTypes.length === 1) params.set('membershipType', selectedPracticeTypes[0])
    if (selectedAnimals.length) params.set('animalType', selectedAnimals.join(','))
    if (selectedServices.length) params.set('service', selectedServices.join(','))
    try {
      setResult(await apiClient<Paginated<Practice>>(`/api/practices?${params}`, {}, { authenticated: false }))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Practices could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [page, selectedAnimals, selectedPracticeTypes, selectedServices, sort, submittedQuery])

  useEffect(() => { queueMicrotask(() => void load()) }, [load])

  function toggle<T extends string>(current: T[], value: T, update: (next: T[]) => void) {
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    setPage(1)
  }

  const filterContent = <div className="space-y-6">
    <FilterGroup title="Practice type" options={practiceTypes} selected={selectedPracticeTypes} onToggle={(value) => toggle(selectedPracticeTypes, value as PracticeMembershipType, setSelectedPracticeTypes)} />
    <FilterGroup title="Animal type" options={animalTypes} selected={selectedAnimals} onToggle={(value) => toggle(selectedAnimals, value, setSelectedAnimals)} />
    <FilterGroup title="Services" options={services} selected={selectedServices} onToggle={(value) => toggle(selectedServices, value, setSelectedServices)} />
    {(selectedPracticeTypes.length > 0 || selectedAnimals.length > 0 || selectedServices.length > 0) && <button type="button" onClick={() => { setSelectedPracticeTypes([]); setSelectedAnimals([]); setSelectedServices([]); setPage(1) }} className="text-xs font-semibold text-[#01AEAD] hover:underline">Clear all filters</button>}
  </div>

  const cards = result?.items.map(toCard) ?? []
  return <div>
    <PageHeader title="Find a Vet" description="Search live approved practices by name, animal type and service." />
    <Card className="mb-6 p-3"><form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedQuery(query.trim()) }}><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Practice name or treatment" className="h-11 w-full rounded-lg border bg-white pl-9 pr-4 text-sm outline-none focus:border-[#01AEAD]" /></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#064071] px-6 text-sm font-semibold text-white"><Search className="size-4" />Search</button></form></Card>
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block"><Card className="sticky top-20 p-5"><div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="size-4 text-[#064071]" /><h2 className="font-semibold">Filters</h2></div>{filterContent}</Card></aside>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3"><p className="text-sm text-muted-foreground">{loading ? 'Loading practices...' : `${result?.total ?? 0} practices found`}</p><div className="flex gap-2"><button type="button" onClick={() => setFiltersOpen((current) => !current)} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium lg:hidden"><SlidersHorizontal className="size-4" />Filters</button><label className="sr-only" htmlFor="practice-sort">Sort practices</label><select id="practice-sort" value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setPage(1) }} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="rating">Highest rated</option><option value="newest">Newest</option><option value="name">Name A-Z</option></select></div></div>
        {filtersOpen && <Card className="mb-4 p-5 lg:hidden">{filterContent}</Card>}
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!loading && cards.length === 0 ? <EmptyState icon={Search} title="No practices found" description="Try a broader search or clear one of the filters." /> : <div className="grid gap-4 sm:grid-cols-2">{cards.map((practice) => <PracticeCard key={practice.id} practice={practice} />)}</div>}
        {(result?.totalPages ?? 0) > 1 && <nav aria-label="Practice result pages" className="mt-6 flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-muted-foreground">Page {page} of {result?.totalPages}</span><button type="button" disabled={page >= (result?.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></nav>}
      </section>
    </div>
  </div>
}

function FilterGroup({ title, options, selected, onToggle }: { title: string; options: Array<string | { label: string; value: string }>; selected: string[]; onToggle: (value: string) => void }) {
  return <fieldset className="border-t pt-5 first:border-t-0 first:pt-0"><legend className="mb-3 text-sm font-semibold">{title}</legend><div className="space-y-2.5">{options.map((option) => { const value = typeof option === 'string' ? option : option.value; const label = typeof option === 'string' ? option : option.label; return <label key={value} className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="size-4 accent-[#01AEAD]" />{label}</label> })}</div></fieldset>
}
