'use client'

import { useEffect, useState } from 'react'
import { Archive, Reply } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import { AdminPageBanner } from '../shared/admin-page-banner'

type Status = 'NEW' | 'IN_PROGRESS' | 'REPLIED' | 'CLOSED'
type Enquiry = { id: string; name: string; email: string; subject: string; message: string; status: Status; reply: string | null; createdAt: string }

export function ContactEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [status, setStatus] = useState<Status | 'ALL'>('NEW')
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Paginated<Enquiry>>(`/api/admin/enquiries?page=1&limit=100${status === 'ALL' ? '' : `&status=${status}`}`)
      .then((result) => setItems(result.items))
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Enquiries could not be loaded.'))
  }, [status])

  async function reply(item: Enquiry) {
    const text = window.prompt(`Reply to ${item.email}:`, item.reply ?? '')
    if (!text) return
    try {
      const updated = await apiClient<Enquiry>(`/api/admin/enquiries/${item.id}/reply`, { method: 'POST', body: JSON.stringify({ reply: text }) })
      setItems((current) => status === 'NEW' ? current.filter((value) => value.id !== item.id) : current.map((value) => value.id === item.id ? updated : value))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Reply could not be sent.')
    }
  }

  async function close(item: Enquiry) {
    try {
      await apiClient(`/api/admin/enquiries/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'CLOSED' }) })
      setItems((current) => status === 'ALL' ? current.map((value) => value.id === item.id ? { ...value, status: 'CLOSED' } : value) : current.filter((value) => value.id !== item.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Enquiry could not be closed.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Contact Enquiries" description="Messages submitted through the public contact form." />
      <div className="flex flex-wrap gap-2">{(['NEW', 'IN_PROGRESS', 'REPLIED', 'CLOSED', 'ALL'] as const).map((value) => <button key={value} onClick={() => setStatus(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === value ? 'bg-[#01AEAD] text-white' : 'bg-white'}`}>{value}</button>)}</div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4">
        {items.map((item) => <Card key={item.id} className="p-5"><div className="flex flex-col gap-4 md:flex-row"><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><h2 className="font-semibold">{item.subject}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.status}</span></div><p className="mt-2 text-sm text-muted-foreground">{item.message}</p><p className="mt-3 text-xs text-muted-foreground">{item.name} &middot; {item.email} &middot; {new Date(item.createdAt).toLocaleString('en-GB')}</p>{item.reply && <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm"><strong>Reply:</strong> {item.reply}</p>}</div><div className="flex gap-2"><button onClick={() => void reply(item)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#064071] px-3 text-sm font-semibold text-white"><Reply className="size-4" />Reply</button>{item.status !== 'CLOSED' && <button onClick={() => void close(item)} className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold"><Archive className="size-4" />Close</button>}</div></div></Card>)}
        {!items.length && <Card className="p-8 text-center text-sm text-muted-foreground">No enquiries in this queue.</Card>}
      </div>
    </div>
  )
}
