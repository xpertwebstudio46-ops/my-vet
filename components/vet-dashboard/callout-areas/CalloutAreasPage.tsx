'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Check, ExternalLink, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { Modal } from '@/components/dashboard/modal'
import { type CalloutArea, calloutDays, calloutDayNames, calloutPrice } from '@/lib/callout-areas'

type Draft = { location: string; description: string; postcodes: string; days: number[]; standardMin: string; standardMax: string; reducedMin: string; reducedMax: string; active: boolean }
const emptyDraft: Draft = { location: '', description: '', postcodes: '', days: [], standardMin: '', standardMax: '', reducedMin: '', reducedMax: '', active: true }
const fieldClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#064071] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b568e] disabled:cursor-wait disabled:opacity-50'

function fromArea(area: CalloutArea): Draft { return { ...area, description: area.description ?? '', postcodes: area.postcodes.join(', ') } }
function payload(draft: Draft) {
  return { ...draft, description: draft.description.trim() || null, postcodes: draft.postcodes.split(/[,\n]+/).map((value) => value.trim()).filter(Boolean), standardMin: Number(draft.standardMin), standardMax: Number(draft.standardMax), reducedMin: Number(draft.reducedMin), reducedMax: Number(draft.reducedMax) }
}
function errorMessage(error: unknown) {
  if (error instanceof ApiClientError && error.details) return Object.entries(error.details).map(([key, values]) => `${key}: ${values.join(', ')}`).join(' · ')
  return error instanceof Error ? error.message : 'This action could not be completed. Please try again.'
}

export default function CalloutAreasPage() {
  const [items, setItems] = useState<CalloutArea[]>([])
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<CalloutArea | 'new' | null>(null)
  const [deleting, setDeleting] = useState<CalloutArea | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [busy, setBusy] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    let active = true
    void apiClient<{ practice: { slug: string } | null }>('/api/vet/dashboard').then(({ practice }) => { if (active && practice) setSlug(practice.slug) }).catch(() => { /* The public-profile link is optional. */ })
    return () => { active = false }
  }, [])
  useEffect(() => {
    let active = true
    void apiClient<CalloutArea[]>('/api/vet/callout-areas').then((areas) => { if (active) { setItems(areas); setError('') } }).catch((caught) => { if (active) setError(errorMessage(caught)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [revision])
  function open(area?: CalloutArea) { setEditing(area ?? 'new'); setDraft(area ? fromArea(area) : { ...emptyDraft, days: [] }); setFormError(''); setMessage('') }
  function set<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })) }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError('')
    if (!draft.days.length) { setFormError('Choose at least one available day.'); return }
    setBusy('save')
    try {
      const saved = await apiClient<CalloutArea>(editing === 'new' ? '/api/vet/callout-areas' : `/api/vet/callout-areas/${(editing as CalloutArea).id}`, { method: editing === 'new' ? 'POST' : 'PUT', body: JSON.stringify(payload(draft)) })
      setItems((current) => editing === 'new' ? [...current, saved] : current.map((area) => area.id === saved.id ? saved : area))
      setEditing(null); setMessage(saved.active ? 'Call-out area saved. It will appear under Services on your public practice profile.' : 'Call-out area saved as hidden.'); setError('')
    } catch (caught) { setFormError(errorMessage(caught)) } finally { setBusy('') }
  }
  async function toggle(area: CalloutArea) {
    setBusy(area.id); setError(''); setMessage('')
    try {
      const saved = await apiClient<CalloutArea>(`/api/vet/callout-areas/${area.id}`, { method: 'PUT', body: JSON.stringify({ ...payload(fromArea(area)), active: !area.active }) })
      setItems((current) => current.map((item) => item.id === saved.id ? saved : item)); setMessage(saved.active ? 'Area is now visible on your profile.' : 'Area is now hidden from your profile.')
    } catch (caught) { setError(errorMessage(caught)) } finally { setBusy('') }
  }
  async function remove() {
    if (!deleting) return
    setBusy('delete'); setError('')
    try { await apiClient(`/api/vet/callout-areas/${deleting.id}`, { method: 'DELETE' }); setItems((current) => current.filter((area) => area.id !== deleting.id)); setDeleting(null); setMessage('Call-out area deleted.') } catch (caught) { setError(errorMessage(caught)); setDeleting(null) } finally { setBusy('') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <div><div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-teal-700"><MapPin size={17} />Practice services</div><h1 className="dashboard-heading text-4xl text-[#064071]">Call-out Areas</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Set the locations, postcodes and days you visit, with standard and free or reduced call-out prices.</p></div>
        <div className="flex flex-wrap items-center gap-4">{slug && <Link href={`/vet-search/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">View public profile <ExternalLink size={15} /></Link>}<button type="button" onClick={() => open()} className={buttonClass}><Plus size={17} />Add call-out area</button></div>
      </div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button onClick={() => { setLoading(true); setRevision((value) => value + 1) }} className="ml-2 font-semibold underline">Retry</button></div>}
      {message && <p role="status" className="rounded-xl bg-teal-50 p-4 text-sm text-teal-800">{message}</p>}
      {loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading call-out areas">{[1, 2, 3].map((number) => <div key={number} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />)}<span className="sr-only">Loading...</span></div> : !items.length && !error ? <div className="rounded-2xl border border-dashed border-teal-200 bg-white p-10 text-center"><MapPin className="mx-auto mb-4 text-teal-600" size={34} /><h2 className="text-xl font-bold text-[#064071]">Where do you offer call-outs?</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500">Add your first area, choose Monday–Sunday availability and set your prices. Pet owners will see the details under Services on your practice profile.</p><button onClick={() => open()} className={`${buttonClass} mt-6`}><Plus size={17} />Add your first area</button></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((area) => (
        <article key={area.id} className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><h2 className="break-words text-lg font-bold text-[#064071]">{area.location}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${area.active ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>{area.active ? 'Published' : 'Hidden'}</span></div>
          {area.description && <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-500">{area.description}</p>}
          <div className="mt-5 grid grid-cols-7 gap-1">{calloutDays.map((day, index) => <div key={day} className="text-center" aria-label={`${calloutDayNames[index]}: ${area.days.includes(index) ? 'available' : 'unavailable'}`}><span className="mb-1.5 block text-[11px] text-slate-500">{day}</span><span className={`flex h-7 items-center justify-center rounded-md ${area.days.includes(index) ? 'bg-[#064071] text-white' : 'bg-slate-100'}`}>{area.days.includes(index) && <Check size={14} aria-hidden="true" />}</span></div>)}</div>
          <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">Standard cost</dt><dd className="font-semibold">{calloutPrice(area.standardMin, area.standardMax)}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">Free / reduced</dt><dd className="font-bold text-teal-700">{calloutPrice(area.reducedMin, area.reducedMax)}</dd></div></dl>
          {!!area.postcodes.length && <div className="mt-4 flex flex-wrap gap-1.5">{area.postcodes.map((postcode) => <span key={postcode} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">{postcode}</span>)}</div>}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4"><button type="button" disabled={!!busy} onClick={() => open(area)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#064071]"><Pencil size={14} />Edit</button><button type="button" disabled={!!busy} onClick={() => toggle(area)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">{busy === area.id && <Loader2 size={14} className="animate-spin" />}{area.active ? 'Hide' : 'Publish'}</button><button type="button" disabled={!!busy} onClick={() => setDeleting(area)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-red-600"><Trash2 size={14} />Delete</button></div>
        </article>
      ))}</div>}

      <Modal open={!!editing} onClose={() => { if (!busy) setEditing(null) }} title={editing === 'new' ? 'Add call-out area' : 'Edit call-out area'} description="Set your area details, weekly availability and prices in GBP." className="max-w-3xl sm:max-w-3xl">
        <form onSubmit={save} className="mt-5 space-y-5">
          {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <label className="block text-sm font-medium text-slate-700">Location / area name<input required minLength={2} maxLength={160} value={draft.location} onChange={(event) => set('location', event.target.value)} className={fieldClass} placeholder="e.g. Birmingham City Centre" /></label>
          <label className="block text-sm font-medium text-slate-700">Description (optional)<textarea maxLength={2000} rows={3} value={draft.description} onChange={(event) => set('description', event.target.value)} className={fieldClass} placeholder="e.g. Reduced-fee home visits on selected zone days" /></label>
          <label className="block text-sm font-medium text-slate-700">Postcodes (optional)<input value={draft.postcodes} onChange={(event) => set('postcodes', event.target.value)} maxLength={600} className={fieldClass} placeholder="B1, B2, B3, B15" /><span className="mt-1 block text-xs font-normal text-slate-500">Separate each postcode or postcode district with a comma.</span></label>
          <fieldset><legend className="mb-3 text-sm font-semibold text-slate-700">Available days</legend><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{calloutDays.map((day, index) => <label key={day} className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium ${draft.days.includes(index) ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600'}`}><span>{day}</span><input type="checkbox" aria-label={calloutDayNames[index]} checked={draft.days.includes(index)} onChange={(event) => set('days', event.target.checked ? [...draft.days, index].sort() : draft.days.filter((value) => value !== index))} className="h-4 w-4 accent-teal-600" /></label>)}</div></fieldset>
          <div className="grid gap-5 sm:grid-cols-2"><fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-1 text-sm font-semibold text-[#064071]">Standard cost (£)</legend><div className="grid grid-cols-2 gap-3">{(['standardMin', 'standardMax'] as const).map((key, index) => <label key={key} className="text-xs text-slate-600">{index === 0 ? 'Minimum' : 'Maximum'}<input type="number" min="0" max="1000000" step="0.01" required value={draft[key]} onChange={(event) => set(key, event.target.value)} className={fieldClass} placeholder={index === 0 ? '45' : '75'} /></label>)}</div></fieldset><fieldset className="rounded-xl border border-teal-200 bg-teal-50/40 p-4"><legend className="px-1 text-sm font-semibold text-teal-800">Free / reduced cost (£)</legend><div className="grid grid-cols-2 gap-3">{(['reducedMin', 'reducedMax'] as const).map((key, index) => <label key={key} className="text-xs text-slate-600">{index === 0 ? 'Minimum' : 'Maximum'}<input type="number" min="0" max="1000000" step="0.01" required value={draft[key]} onChange={(event) => set(key, event.target.value)} className={fieldClass} placeholder={index === 0 ? '0' : '20'} /></label>)}</div><label className="mt-3 flex items-center gap-2 text-xs text-teal-800"><input type="checkbox" checked={draft.reducedMin === '0' && draft.reducedMax === '0'} onChange={(event) => setDraft((current) => ({ ...current, reducedMin: event.target.checked ? '0' : '', reducedMax: event.target.checked ? '0' : '' }))} className="h-4 w-4 accent-teal-600" />Completely free call-out</label></fieldset></div>
          <p className="text-xs text-slate-500">For a fixed price, enter the same minimum and maximum. Use 0 for free. Reduced costs must not exceed the standard costs.</p>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={draft.active} onChange={(event) => set('active', event.target.checked)} className="h-4 w-4 accent-teal-600" />Publish on my public practice profile</label>
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" disabled={!!busy} onClick={() => setEditing(null)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button disabled={!!busy} className={buttonClass}>{busy === 'save' && <Loader2 size={16} className="animate-spin" />}{busy === 'save' ? 'Saving...' : 'Save area'}</button></div>
        </form>
      </Modal>
      <Modal open={!!deleting} onClose={() => { if (!busy) setDeleting(null) }} title="Delete call-out area?" description={`This removes ${deleting?.location ?? 'this area'} from your dashboard and public Services section.`}>
        <div className="mt-6 flex justify-end gap-3"><button disabled={!!busy} onClick={() => setDeleting(null)} className="rounded-full border px-5 py-2.5 text-sm">Cancel</button><button disabled={!!busy} onClick={remove} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === 'delete' && <Loader2 size={15} className="animate-spin" />}Delete area</button></div>
      </Modal>
    </div>
  )
}
