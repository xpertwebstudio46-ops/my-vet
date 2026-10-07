'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil, Search, ShieldBan, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import { downloadCsv } from '@/lib/csv'
import { AdminPageBanner } from './shared/admin-page-banner'

type PracticeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED'
type PracticeMembershipType = 'INDEPENDENT' | 'GROUP'
type Practice = {
  id: string
  ownerId: string
  slug: string
  name: string
  description: string | null
  whatWeDo: string | null
  careOptions: string[]
  addressLine1: string
  addressLine2: string | null
  city: string
  county: string | null
  postcode: string
  phone: string
  email: string
  website: string | null
  logoUrl: string | null
  bannerUrl: string | null
  timezone: string
  latitude: string | null
  longitude: string | null
  status: PracticeStatus
  membershipType: PracticeMembershipType
  branchCount: number
  moderationReason: string | null
  rating: string
  reviewCount: number
  legacyRatingTotal: string
  legacyReviewCount: number
  isFeatured: boolean
  featuredUntil: string | null
  stripeCustomerId: string | null
  createdAt: string
  updatedAt: string
  owner: { id: string; email: string; firstName: string; lastName: string }
}
type UserApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type User = { id: string; email: string; role: 'PET_OWNER' | 'VET' | 'ADMIN'; approvalStatus: UserApprovalStatus; firstName: string; lastName: string; deletedAt: string | null; createdAt: string }
type PracticeAction = { item: Practice; status: PracticeStatus }

function ErrorBox({ message }: { message: string }) {
  return message ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div> : null
}

export function ManageVeterinaryPracticePage() {
  const [items, setItems] = useState<Practice[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<PracticeAction | null>(null)
  const [editing, setEditing] = useState<Practice | null>(null)

  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get('q')?.trim() ?? ''
    void load(term).then(() => setQuery(term))
  }, [])

  async function load(term = '') {
    setLoading(true)
    setError('')
    try {
      const result = await apiClient<Paginated<Practice>>(`/api/admin/practices?page=1&limit=100${term ? `&q=${encodeURIComponent(term)}` : ''}`)
      setItems(result.items)
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Practices could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(reason: string) {
    if (!action) return
    try {
      const updated = await apiClient<Practice>(`/api/admin/practices/${action.item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: action.status, reason }) })
      setItems((current) => current.map((value) => value.id === action.item.id ? { ...value, status: updated.status } : value))
      setAction(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Practice could not be updated.')
    }
  }

  function exportItems() {
    if (!downloadCsv('veterinary-practices.csv', items.map((item) => ({ Practice: item.name, Owner: `${item.owner.firstName} ${item.owner.lastName}`, 'Owner email': item.owner.email, Location: item.city, Rating: item.rating, Reviews: item.reviewCount, Status: item.status, Submitted: new Date(item.createdAt).toLocaleDateString('en-GB') })))) setError('There are no practices to export.')
  }

  return <div className="min-w-0 space-y-6">
    <AdminPageBanner title="Manage Veterinary Practices" description="Live practice directory records and moderation status." action={{ label: 'Export CSV', icon: 'download', tone: 'outline', onClick: exportItems }} />
    <form onSubmit={(event) => { event.preventDefault(); void load(query) }} className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search practices" className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm" /></div><button className="h-10 rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form>
    <ErrorBox message={error} />
    <PracticeTable items={items} loading={loading} actions={(item) => <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setEditing(item)} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-semibold text-[#064071]"><Pencil className="size-3.5" />Edit</button>{item.status !== 'APPROVED' && <button type="button" onClick={() => setAction({ item, status: 'APPROVED' })} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Approve</button>}{item.status !== 'SUSPENDED' && <button type="button" onClick={() => setAction({ item, status: 'SUSPENDED' })} className="rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700">Suspend</button>}{item.status !== 'ARCHIVED' && <button type="button" onClick={() => setAction({ item, status: 'ARCHIVED' })} className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Archive</button>}</div>} />
    {action && <ModerationModal action={action} onClose={() => setAction(null)} onConfirm={setStatus} />}
    {editing && <PracticeEditModal practice={editing} onClose={() => setEditing(null)} onSave={(saved) => { setItems((current) => current.map((value) => value.id === saved.id ? saved : value)); setEditing(null) }} />}
  </div>
}

export function PendingApprovalsPage() {
  const [items, setItems] = useState<Practice[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  const [action, setAction] = useState<PracticeAction | null>(null)

  useEffect(() => {
    void Promise.all([
      apiClient<Paginated<Practice>>('/api/admin/practices?page=1&limit=100&status=PENDING'),
      apiClient<Paginated<User>>('/api/admin/users?page=1&limit=100&role=PET_OWNER&approvalStatus=PENDING'),
    ])
      .then(([practices, petOwners]) => {
        setItems(practices.items)
        setUsers(petOwners.items)
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Approvals could not be loaded.'))
  }, [])

  async function moderate(reason: string) {
    if (!action) return
    try {
      await apiClient(`/api/admin/practices/${action.item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: action.status, reason }) })
      setItems((current) => current.filter((value) => value.id !== action.item.id))
      setAction(null)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Practice could not be moderated.') }
  }

  async function moderateUser(item: User, approvalStatus: UserApprovalStatus) {
    try {
      await apiClient(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ approvalStatus }) })
      setUsers((current) => current.filter((value) => value.id !== item.id))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Pet owner could not be moderated.') }
  }

  return <div className="min-w-0 space-y-6"><AdminPageBanner title="Pending Approvals" description="Review practice registrations and pet-owner accounts before access." /><ErrorBox message={error} />{items.length > 0 && <section className="space-y-3"><h2 className="font-semibold text-black">Practice approvals</h2><div className="grid gap-4">{items.map((item) => <Card key={item.id} className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center"><div className="min-w-0 flex-1"><h3 className="break-words font-semibold text-black">{item.name}</h3><p className="mt-1 break-words text-sm text-muted-foreground">{item.owner.firstName} {item.owner.lastName} &middot; {item.owner.email}</p><p className="mt-1 text-sm text-muted-foreground">{item.city} &middot; Submitted {new Date(item.createdAt).toLocaleDateString('en-GB')}</p></div><div className="grid gap-2 sm:flex"><button type="button" onClick={() => setAction({ item, status: 'REJECTED' })} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700"><X className="size-4" />Reject</button><button type="button" onClick={() => setAction({ item, status: 'APPROVED' })} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white"><Check className="size-4" />Approve</button></div></Card>)}</div></section>}{users.length > 0 && <section className="space-y-3"><h2 className="font-semibold text-black">Pet owner approvals</h2><div className="grid gap-4">{users.map((item) => <Card key={item.id} className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center"><div className="min-w-0 flex-1"><h3 className="break-words font-semibold text-black">{item.firstName} {item.lastName}</h3><p className="mt-1 break-words text-sm text-muted-foreground">{item.email}</p><p className="mt-1 text-sm text-muted-foreground">Joined {new Date(item.createdAt).toLocaleDateString('en-GB')}</p></div><div className="grid gap-2 sm:flex"><button type="button" onClick={() => void moderateUser(item, 'REJECTED')} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700"><X className="size-4" />Reject</button><button type="button" onClick={() => void moderateUser(item, 'APPROVED')} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white"><Check className="size-4" />Approve</button></div></Card>)}</div></section>}{!items.length && !users.length && <Card className="p-8 text-center text-sm text-muted-foreground">No accounts or practices are waiting for approval.</Card>}{action && <ModerationModal action={action} onClose={() => setAction(null)} onConfirm={moderate} />}</div>
}

export function PetOwnerPage() {
  const [items, setItems] = useState<User[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    void apiClient<Paginated<User>>('/api/admin/users?page=1&limit=100&role=PET_OWNER')
      .then((result) => setItems(result.items))
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Pet owners could not be loaded.'))
  }, [])

  async function load() {
    try {
      const result = await apiClient<Paginated<User>>(`/api/admin/users?page=1&limit=100&role=PET_OWNER${query ? `&q=${encodeURIComponent(query)}` : ''}`)
      setItems(result.items)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Pet owners could not be loaded.') }
  }

  async function toggle(item: User) {
    try {
      const updated = await apiClient<{ approvalStatus: UserApprovalStatus; deletedAt: string | null }>(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ deactivated: !item.deletedAt }) })
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, approvalStatus: updated.approvalStatus, deletedAt: updated.deletedAt } : value))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'User could not be updated.') }
  }

  function exportItems() {
    if (!downloadCsv('pet-owners.csv', items.map((item) => ({ Owner: `${item.firstName} ${item.lastName}`, Email: item.email, Joined: new Date(item.createdAt).toLocaleDateString('en-GB'), Approval: item.approvalStatus, Status: item.deletedAt ? 'Deactivated' : 'Active' })))) setError('There are no pet owners to export.')
  }

  return <div className="min-w-0 space-y-6"><AdminPageBanner title="Pet Owners" description="Manage pet-owner accounts and access." action={{ label: 'Export CSV', icon: 'download', tone: 'outline', onClick: exportItems }} /><form onSubmit={(event) => { event.preventDefault(); void load() }} className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm" /><button className="h-10 rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form><ErrorBox message={error} /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Owner</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.firstName} {item.lastName}</td><td className="p-4">{item.email}</td><td className="p-4">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td><td className="p-4">{item.deletedAt ? 'Deactivated' : 'Active'}</td><td className="p-4 text-right"><button type="button" onClick={() => void toggle(item)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"><ShieldBan className="size-4" />{item.deletedAt ? 'Reactivate' : 'Deactivate'}</button></td></tr>)}</tbody></table></div></Card></div>
}

function ModerationModal({ action, onClose, onConfirm }: { action: PracticeAction; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState(action.status === 'APPROVED' ? 'Practice details verified' : `Admin changed status to ${action.status.toLowerCase()}`)
  const [saving, setSaving] = useState(false)
  const verb = action.status.charAt(0) + action.status.slice(1).toLowerCase()
  return <Modal open onClose={onClose} title={`${verb} ${action.item.name}?`} description="Add a note for the audit history and practice owner."><form onSubmit={(event) => { event.preventDefault(); if (!reason.trim()) return; setSaving(true); void onConfirm(reason.trim()).finally(() => setSaving(false)) }}><label className="block text-sm font-medium">Reason<textarea autoFocus required value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border p-3 text-sm" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button disabled={saving || !reason.trim()} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : `Confirm ${verb.toLowerCase()}`}</button></div></form></Modal>
}

function PracticeEditModal({ practice, onClose, onSave }: { practice: Practice; onClose: () => void; onSave: (practice: Practice) => void }) {
  const [draft, setDraft] = useState<Practice>({ ...practice, careOptions: practice.careOptions ?? [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof Practice>(key: K, value: Practice[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const setNullable = (key: keyof Practice, value: string) => set(key, (value.trim() || null) as never)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = await apiClient<Practice>(`/api/admin/practices/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          slug: draft.slug,
          name: draft.name,
          description: draft.description,
          whatWeDo: draft.whatWeDo,
          careOptions: draft.careOptions,
          addressLine1: draft.addressLine1,
          addressLine2: draft.addressLine2,
          city: draft.city,
          county: draft.county,
          postcode: draft.postcode,
          phone: draft.phone,
          email: draft.email,
          website: draft.website,
          logoUrl: draft.logoUrl,
          bannerUrl: draft.bannerUrl,
          timezone: draft.timezone,
          latitude: draft.latitude === null ? null : Number(draft.latitude),
          longitude: draft.longitude === null ? null : Number(draft.longitude),
          status: draft.status,
          membershipType: draft.membershipType,
          branchCount: draft.branchCount,
          moderationReason: draft.moderationReason,
          rating: Number(draft.rating),
          reviewCount: draft.reviewCount,
          legacyRatingTotal: Number(draft.legacyRatingTotal),
          legacyReviewCount: draft.legacyReviewCount,
          isFeatured: draft.isFeatured,
          featuredUntil: draft.featuredUntil,
        }),
      })
      onSave({ ...saved, careOptions: saved.careOptions ?? [] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Practice could not be updated.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`Edit ${practice.name}`} description="Update scalar fields from the Practice table." className="max-w-5xl">
      <form onSubmit={(event) => void save(event)} className="space-y-5">
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <section className="grid gap-3 rounded-xl border bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReadOnlyField label="ID" value={draft.id} />
          <ReadOnlyField label="Owner ID" value={draft.ownerId} />
          <ReadOnlyField label="Owner" value={`${draft.owner.firstName} ${draft.owner.lastName} (${draft.owner.email})`} />
          <ReadOnlyField label="Stripe customer ID" value={draft.stripeCustomerId ?? ''} />
          <ReadOnlyField label="Created at" value={formatDateTime(draft.createdAt)} />
          <ReadOnlyField label="Updated at" value={formatDateTime(draft.updatedAt)} />
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" value={draft.slug} onChange={(value) => set('slug', value)} />
          <Field label="Practice name" value={draft.name} onChange={(value) => set('name', value)} />
          <Field label="Email" type="email" value={draft.email} onChange={(value) => set('email', value)} />
          <Field label="Phone" value={draft.phone} onChange={(value) => set('phone', value)} />
          <Field label="Website" type="url" value={draft.website ?? ''} onChange={(value) => setNullable('website', value)} required={false} />
          <Field label="Logo URL" type="url" value={draft.logoUrl ?? ''} onChange={(value) => setNullable('logoUrl', value)} required={false} />
          <Field label="Banner URL" type="url" value={draft.bannerUrl ?? ''} onChange={(value) => setNullable('bannerUrl', value)} required={false} />
          <Field label="Timezone" value={draft.timezone} onChange={(value) => set('timezone', value)} />
          <Field label="Address line 1" value={draft.addressLine1} onChange={(value) => set('addressLine1', value)} />
          <Field label="Address line 2" value={draft.addressLine2 ?? ''} onChange={(value) => setNullable('addressLine2', value)} required={false} />
          <Field label="City" value={draft.city} onChange={(value) => set('city', value)} />
          <Field label="County" value={draft.county ?? ''} onChange={(value) => setNullable('county', value)} required={false} />
          <Field label="Postcode" value={draft.postcode} onChange={(value) => set('postcode', value)} />
          <Field label="Latitude" type="number" value={draft.latitude ?? ''} onChange={(value) => set('latitude', value || null)} required={false} step="0.0000001" />
          <Field label="Longitude" type="number" value={draft.longitude ?? ''} onChange={(value) => set('longitude', value || null)} required={false} step="0.0000001" />
          <label className="text-sm font-medium">
            Status
            <select value={draft.status} onChange={(event) => set('status', event.target.value as PracticeStatus)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm">
              {(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED'] as PracticeStatus[]).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">
            Membership type
            <select value={draft.membershipType} onChange={(event) => set('membershipType', event.target.value as PracticeMembershipType)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm">
              <option value="INDEPENDENT">INDEPENDENT</option>
              <option value="GROUP">GROUP</option>
            </select>
          </label>
          <Field label="Branch count" type="number" value={String(draft.branchCount)} onChange={(value) => set('branchCount', Number(value) || 1)} min="1" />
          <Field label="Rating" type="number" value={draft.rating} onChange={(value) => set('rating', value)} min="0" max="5" step="0.01" />
          <Field label="Review count" type="number" value={String(draft.reviewCount)} onChange={(value) => set('reviewCount', Number(value) || 0)} min="0" />
          <Field label="Legacy rating total" type="number" value={draft.legacyRatingTotal} onChange={(value) => set('legacyRatingTotal', value)} min="0" step="0.01" />
          <Field label="Legacy review count" type="number" value={String(draft.legacyReviewCount)} onChange={(value) => set('legacyReviewCount', Number(value) || 0)} min="0" />
          <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium sm:mt-7">
            <input type="checkbox" checked={draft.isFeatured} onChange={(event) => set('isFeatured', event.target.checked)} className="size-4 accent-[#01AEAD]" />
            Featured practice
          </label>
          <Field label="Featured until" type="datetime-local" value={toDateTimeLocal(draft.featuredUntil)} onChange={(value) => set('featuredUntil', value ? new Date(value).toISOString() : null)} required={false} />
          <label className="text-sm font-medium sm:col-span-2">
            Moderation reason
            <textarea value={draft.moderationReason ?? ''} onChange={(event) => setNullable('moderationReason', event.target.value)} rows={3} className="mt-2 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Description
            <textarea value={draft.description ?? ''} onChange={(event) => setNullable('description', event.target.value)} rows={5} className="mt-2 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            What we do
            <textarea value={draft.whatWeDo ?? ''} onChange={(event) => setNullable('whatWeDo', event.target.value)} rows={5} className="mt-2 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Care options
            <textarea value={draft.careOptions.join('\n')} onChange={(event) => set('careOptions', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} rows={5} className="mt-2 w-full rounded-md border p-3 text-sm" />
          </label>
        </section>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button>
          <button disabled={saving} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text', required = true, min, max, step }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; min?: string; max?: string; step?: string }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input required={required} type={type} min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" />
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input readOnly value={value || '-'} className="mt-1 h-9 w-full rounded-md border bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-600" /></label>
}

function toDateTimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

function PracticeTable({ items, loading, actions }: { items: Practice[]; loading: boolean; actions: (item: Practice) => React.ReactNode }) {
  return <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Practice</th><th className="p-4">Owner</th><th className="p-4">Location</th><th className="p-4">Rating</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.name}</td><td className="p-4">{item.owner.firstName} {item.owner.lastName}<span className="block text-xs text-muted-foreground">{item.owner.email}</span></td><td className="p-4">{item.city}</td><td className="p-4">{item.rating} ({item.reviewCount})</td><td className="p-4">{item.status}</td><td className="p-4">{actions(item)}</td></tr>)}{loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading practices...</td></tr>}{!loading && !items.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No practices found.</td></tr>}</tbody></table></div></Card>
}
