'use client'

import { useState } from 'react'
import type { AnimalTypeOption } from '@/components/directory/Bar'
import { Search, SlidersHorizontal } from 'lucide-react'

const groups = [
  { title: 'Practice Type', key: 'membershipType', options: [{ label: 'Independent Practice', value: 'INDEPENDENT' }, { label: 'Vet Group', value: 'GROUP' }] },
] as const

type FilterKey = typeof groups[number]['key'] | 'animalType' | 'service'

export default function FindVetFilters({ serviceOptions, animalTypes, query, onChange }: { serviceOptions: string[]; animalTypes: AnimalTypeOption[]; query: string; onChange: (query: string) => void }) {
  const searchParams = new URLSearchParams(query)
  const [expanded, setExpanded] = useState<string[]>([])
  const filterGroups = [...groups, { title: 'Animal Types', key: 'animalType' as const, options: animalTypes.map((item) => ({ label: item.name, value: item.slug })) }, { title: 'Services', key: 'service' as const, options: serviceOptions.map((value) => ({ label: value, value })) }]

  function selected(key: string) { return (searchParams.get(key) ?? '').split(',').filter(Boolean) }
  function toggle(key: FilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString()); const current = selected(key); const next = key === 'membershipType' ? (current.includes(value) ? [] : [value]) : (current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    if (next.length) params.set(key, next.join(',')); else params.delete(key)
    params.delete('page'); onChange(params.toString())
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const params = new URLSearchParams(searchParams.toString())
    for (const key of ['q', 'city'] as const) { const value = String(data.get(key) ?? '').trim(); if (value) params.set(key, value); else params.delete(key) }
    params.delete('page'); onChange(params.toString())
  }
  function clear() { const params = new URLSearchParams(searchParams.toString()); for (const key of ['q', 'city', 'animalType', 'service', 'membershipType', 'page']) params.delete(key); onChange(params.toString()) }

  return <aside className="rounded-lg border border-gray-500/15 bg-white p-5 shadow-lg"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><SlidersHorizontal className="text-[#064071]" /><h2 className="text-lg font-bold">Advanced Filters</h2></div><button type="button" onClick={clear} className="text-xs font-semibold text-[#01AEAD]">Clear</button></div><form key={`${searchParams.get('q') ?? ''}:${searchParams.get('city') ?? ''}`} onSubmit={submit} className="mt-5 grid gap-3"><label className="relative"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input name="q" type="search" defaultValue={searchParams.get('q') ?? ''} placeholder="Practice or treatment" className="h-10 w-full rounded-md border pl-9 pr-3 text-sm" /></label><input name="city" defaultValue={searchParams.get('city') ?? ''} placeholder="Town or city" className="h-10 w-full rounded-md border px-3 text-sm" /><button className="h-10 rounded-md bg-[#064071] text-sm font-semibold text-white">Search</button></form>{filterGroups.map((group) => <fieldset className="mt-5 border-t pt-5" key={group.key}><legend className="mb-1 text-base font-medium">{group.title}</legend><div className="space-y-3">{(expanded.includes(group.key) ? group.options : group.options.slice(0, 6)).map((option) => <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-[#475569]"><input type="checkbox" checked={selected(group.key).includes(option.value)} onChange={() => toggle(group.key, option.value)} className="size-4 accent-[#01AEAD]" />{option.label}</label>)}</div>{group.options.length > 6 && <button type="button" aria-expanded={expanded.includes(group.key)} onClick={() => setExpanded((current) => current.includes(group.key) ? current.filter((key) => key !== group.key) : [...current, group.key])} className="mt-3 text-sm font-semibold text-[#01AEAD]">{expanded.includes(group.key) ? "Read less" : "Read more"}</button>}</fieldset>)}</aside>
}
