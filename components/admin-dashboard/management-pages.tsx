'use client'

import { useEffect, useState } from 'react'
import { Check, Search, ShieldBan, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import { AdminPageBanner } from './shared/admin-page-banner'

type Practice = { id: string; name: string; city: string; email: string; rating: string; reviewCount: number; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED'; createdAt: string; owner: { email: string; firstName: string; lastName: string } }
type User = { id: string; email: string; role: 'PET_OWNER' | 'VET' | 'ADMIN'; firstName: string; lastName: string; deletedAt: string | null; createdAt: string }

function ErrorBox({ message }: { message: string }) {
  return message ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div> : null
}

export function ManageVeterinaryPracticePage() {
  const [items, setItems] = useState<Practice[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get('q')?.trim() ?? ''
    void apiClient<Paginated<Practice>>(`/api/admin/practices?page=1&limit=100${term ? `&q=${encodeURIComponent(term)}` : ''}`)
      .then((result) => { setQuery(term); setItems(result.items) })
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Practices could not be loaded.'))
      .finally(() => setLoading(false))
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

  async function setStatus(item: Practice, status: Practice['status']) {
    const reason = window.prompt(`Reason for ${status.toLowerCase()}:`, `Admin changed status to ${status.toLowerCase()}`)
    if (!reason) return
    try {
      const updated = await apiClient<Practice>(`/api/admin/practices/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) })
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, status: updated.status } : value))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Practice could not be updated.')
    }
  }

  return <div className="space-y-6"><AdminPageBanner title="Manage Veterinary Practices" description="Live practice directory records and moderation status." /><form onSubmit={(event) => { event.preventDefault(); void load(query) }} className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search practices" className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm" /></div><button className="rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form><ErrorBox message={error} /><PracticeTable items={items} loading={loading} actions={(item) => <div className="flex justify-end gap-2">{item.status !== 'APPROVED' && <button onClick={() => void setStatus(item, 'APPROVED')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Approve</button>}{item.status !== 'SUSPENDED' && <button onClick={() => void setStatus(item, 'SUSPENDED')} className="rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700">Suspend</button>}{item.status !== 'ARCHIVED' && <button onClick={() => void setStatus(item, 'ARCHIVED')} className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Archive</button>}</div>} /></div>
}

export function PendingApprovalsPage() {
  const [items, setItems] = useState<Practice[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Paginated<Practice>>('/api/admin/practices?page=1&limit=100&status=PENDING')
      .then((result) => setItems(result.items))
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Approvals could not be loaded.'))
  }, [])

  async function moderate(item: Practice, status: 'APPROVED' | 'REJECTED') {
    const reason = window.prompt(status === 'APPROVED' ? 'Approval note:' : 'Rejection reason:', status === 'APPROVED' ? 'Practice details verified' : 'Practice information requires changes')
    if (!reason) return
    try {
      await apiClient(`/api/admin/practices/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) })
      setItems((current) => current.filter((value) => value.id !== item.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Practice could not be moderated.')
    }
  }

  return <div className="space-y-6"><AdminPageBanner title="Pending Approvals" description="Review real practice registrations before publication." /><ErrorBox message={error} /><div className="grid gap-4">{items.map((item) => <Card key={item.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><div className="min-w-0 flex-1"><h2 className="font-semibold text-black">{item.name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.owner.firstName} {item.owner.lastName} &middot; {item.owner.email}</p><p className="mt-1 text-sm text-muted-foreground">{item.city} &middot; Submitted {new Date(item.createdAt).toLocaleDateString('en-GB')}</p></div><div className="flex gap-2"><button onClick={() => void moderate(item, 'REJECTED')} className="inline-flex h-10 items-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700"><X className="size-4" />Reject</button><button onClick={() => void moderate(item, 'APPROVED')} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white"><Check className="size-4" />Approve</button></div></Card>)}{!items.length && <Card className="p-8 text-center text-sm text-muted-foreground">No practices are waiting for approval.</Card>}</div></div>
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pet owners could not be loaded.')
    }
  }

  async function toggle(item: User) {
    try {
      const updated = await apiClient<{ deletedAt: string | null }>(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ deactivated: !item.deletedAt }) })
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, deletedAt: updated.deletedAt } : value))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'User could not be updated.')
    }
  }

  return <div className="space-y-6"><AdminPageBanner title="Pet Owners" description="Manage real pet-owner accounts and access." /><form onSubmit={(event) => { event.preventDefault(); void load() }} className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="h-10 flex-1 rounded-lg border bg-white px-3 text-sm" /><button className="rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white">Search</button></form><ErrorBox message={error} /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Owner</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.firstName} {item.lastName}</td><td className="p-4">{item.email}</td><td className="p-4">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td><td className="p-4">{item.deletedAt ? 'Deactivated' : 'Active'}</td><td className="p-4 text-right"><button onClick={() => void toggle(item)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"><ShieldBan className="size-4" />{item.deletedAt ? 'Reactivate' : 'Deactivate'}</button></td></tr>)}</tbody></table></div></Card></div>
}

function PracticeTable({ items, loading, actions }: { items: Practice[]; loading: boolean; actions: (item: Practice) => React.ReactNode }) {
  return <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Practice</th><th className="p-4">Owner</th><th className="p-4">Location</th><th className="p-4">Rating</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b"><td className="p-4 font-semibold">{item.name}</td><td className="p-4">{item.owner.firstName} {item.owner.lastName}<span className="block text-xs text-muted-foreground">{item.owner.email}</span></td><td className="p-4">{item.city}</td><td className="p-4">{item.rating} ({item.reviewCount})</td><td className="p-4">{item.status}</td><td className="p-4">{actions(item)}</td></tr>)}{loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading practices...</td></tr>}</tbody></table></div></Card>
}
