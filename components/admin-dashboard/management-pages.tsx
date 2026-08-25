'use client'

import { useEffect, useState } from 'react'
import { Check, Search, ShieldBan, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import { downloadCsv } from '@/lib/csv'
import { AdminPageBanner } from './shared/admin-page-banner'

type PracticeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED'
type Practice = { id: string; name: string; city: string; email: string; rating: string; reviewCount: number; status: PracticeStatus; createdAt: string; owner: { email: string; firstName: string; lastName: string } }
type User = { id: string; email: string; role: 'PET_OWNER' | 'VET' | 'ADMIN'; firstName: string; lastName: string; deletedAt: string | null; createdAt: string }
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

  return <div className="space-y-6">
    <AdminPageBanner title="Manage Veterinary Practices" description="Live practice directory records and moderation status." action={{ label: 'Export CSV', icon: 'download', tone: 'outline', onClick: exportItems }} />
    <form onSubmit={(event) => { event.preventDefault(); void load(query) }} className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search practices" className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm" /></div><button className="rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form>
    <ErrorBox message={error} />
    <PracticeTable items={items} loading={loading} actions={(item) => <div className="flex justify-end gap-2">{item.status !== 'APPROVED' && <button type="button" onClick={() => setAction({ item, status: 'APPROVED' })} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Approve</button>}{item.status !== 'SUSPENDED' && <button type="button" onClick={() => setAction({ item, status: 'SUSPENDED' })} className="rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700">Suspend</button>}{item.status !== 'ARCHIVED' && <button type="button" onClick={() => setAction({ item, status: 'ARCHIVED' })} className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Archive</button>}</div>} />
    {action && <ModerationModal action={action} onClose={() => setAction(null)} onConfirm={setStatus} />}
  </div>
}

export function PendingApprovalsPage() {
  const [items, setItems] = useState<Practice[]>([])
  const [error, setError] = useState('')
  const [action, setAction] = useState<PracticeAction | null>(null)

  useEffect(() => { void apiClient<Paginated<Practice>>('/api/admin/practices?page=1&limit=100&status=PENDING').then((result) => setItems(result.items)).catch((caught) => setError(caught instanceof Error ? caught.message : 'Approvals could not be loaded.')) }, [])

  async function moderate(reason: string) {
    if (!action) return
    try {
      await apiClient(`/api/admin/practices/${action.item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: action.status, reason }) })
      setItems((current) => current.filter((value) => value.id !== action.item.id))
      setAction(null)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Practice could not be moderated.') }
  }

  return <div className="space-y-6"><AdminPageBanner title="Pending Approvals" description="Review real practice registrations before publication." /><ErrorBox message={error} /><div className="grid gap-4">{items.map((item) => <Card key={item.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><div className="min-w-0 flex-1"><h2 className="font-semibold text-black">{item.name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.owner.firstName} {item.owner.lastName} &middot; {item.owner.email}</p><p className="mt-1 text-sm text-muted-foreground">{item.city} &middot; Submitted {new Date(item.createdAt).toLocaleDateString('en-GB')}</p></div><div className="flex gap-2"><button type="button" onClick={() => setAction({ item, status: 'REJECTED' })} className="inline-flex h-10 items-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700"><X className="size-4" />Reject</button><button type="button" onClick={() => setAction({ item, status: 'APPROVED' })} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white"><Check className="size-4" />Approve</button></div></Card>)}{!items.length && <Card className="p-8 text-center text-sm text-muted-foreground">No practices are waiting for approval.</Card>}</div>{action && <ModerationModal action={action} onClose={() => setAction(null)} onConfirm={moderate} />}</div>
}

export function PetOwnerPage() {
  const [items, setItems] = useState<User[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    void apiClient<Paginated<User>>('/api/admin/users?page=1&limit=100')
      .then((result) => setItems(result.items.filter((item) => item.role === 'PET_OWNER')))
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Pet owners could not be loaded.'))
  }, [])

  async function load() {
    try {
      const result = await apiClient<Paginated<User>>(`/api/admin/users?page=1&limit=100${query ? `&q=${encodeURIComponent(query)}` : ''}`)
      setItems(result.items.filter((item) => item.role === 'PET_OWNER'))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Pet owners could not be loaded.') }
  }

  async function toggle(item: User) {
    try {
      const updated = await apiClient<{ deletedAt: string | null }>(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ deactivated: !item.deletedAt }) })
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, deletedAt: updated.deletedAt } : value))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'User could not be updated.') }
  }

  function exportItems() {
    if (!downloadCsv('pet-owners.csv', items.map((item) => ({ Owner: `${item.firstName} ${item.lastName}`, Email: item.email, Joined: new Date(item.createdAt).toLocaleDateString('en-GB'), Status: item.deletedAt ? 'Deactivated' : 'Active' })))) setError('There are no pet owners to export.')
  }

  return <div className="space-y-6"><AdminPageBanner title="Pet Owners" description="Manage real pet-owner accounts and access." action={{ label: 'Export CSV', icon: 'download', tone: 'outline', onClick: exportItems }} /><form onSubmit={(event) => { event.preventDefault(); void load() }} className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="h-10 flex-1 rounded-lg border bg-white px-3 text-sm" /><button className="rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form><ErrorBox message={error} /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Owner</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.firstName} {item.lastName}</td><td className="p-4">{item.email}</td><td className="p-4">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td><td className="p-4">{item.deletedAt ? 'Deactivated' : 'Active'}</td><td className="p-4 text-right"><button type="button" onClick={() => void toggle(item)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"><ShieldBan className="size-4" />{item.deletedAt ? 'Reactivate' : 'Deactivate'}</button></td></tr>)}</tbody></table></div></Card></div>
}

function ModerationModal({ action, onClose, onConfirm }: { action: PracticeAction; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState(action.status === 'APPROVED' ? 'Practice details verified' : `Admin changed status to ${action.status.toLowerCase()}`)
  const [saving, setSaving] = useState(false)
  const verb = action.status.charAt(0) + action.status.slice(1).toLowerCase()
  return <Modal open onClose={onClose} title={`${verb} ${action.item.name}?`} description="Add a note for the audit history and practice owner."><form onSubmit={(event) => { event.preventDefault(); if (!reason.trim()) return; setSaving(true); void onConfirm(reason.trim()).finally(() => setSaving(false)) }}><label className="block text-sm font-medium">Reason<textarea autoFocus required value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border p-3 text-sm" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button disabled={saving || !reason.trim()} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : `Confirm ${verb.toLowerCase()}`}</button></div></form></Modal>
}

function PracticeTable({ items, loading, actions }: { items: Practice[]; loading: boolean; actions: (item: Practice) => React.ReactNode }) {
  return <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Practice</th><th className="p-4">Owner</th><th className="p-4">Location</th><th className="p-4">Rating</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.name}</td><td className="p-4">{item.owner.firstName} {item.owner.lastName}<span className="block text-xs text-muted-foreground">{item.owner.email}</span></td><td className="p-4">{item.city}</td><td className="p-4">{item.rating} ({item.reviewCount})</td><td className="p-4">{item.status}</td><td className="p-4">{actions(item)}</td></tr>)}{loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading practices...</td></tr>}{!loading && !items.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No practices found.</td></tr>}</tbody></table></div></Card>
}
