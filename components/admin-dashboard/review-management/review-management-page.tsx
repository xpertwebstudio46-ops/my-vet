'use client'

import { useEffect, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'
import { AdminPageBanner } from '../shared/admin-page-banner'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED'
type Review = { id: string; rating: number; title: string | null; comment: string; status: ReviewStatus; disputeReason: string | null; disputedAt: string | null; createdAt: string; user: { firstName: string; lastName: string; email: string }; practice: { id: string; name: string } }
const reviewStatuses = ['PENDING', 'DISPUTED', 'APPROVED', 'REJECTED', 'ALL'] as const
const statusLabels: Record<(typeof reviewStatuses)[number], string> = {
  PENDING: 'Pending',
  DISPUTED: 'Disputed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ALL: 'All',
}

function initialReviewStatus(): ReviewStatus | 'ALL' {
  if (typeof window === 'undefined') return 'PENDING'
  const requestedStatus = new URLSearchParams(window.location.search).get('status')
  return reviewStatuses.includes(requestedStatus as (typeof reviewStatuses)[number])
    ? requestedStatus as ReviewStatus | 'ALL'
    : 'PENDING'
}

export function ReviewManagementPage() {
  const [items, setItems] = useState<Review[]>([])
  const [status, setStatus] = useState<ReviewStatus | 'ALL'>(initialReviewStatus)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient<Paginated<Review>>(`/api/admin/reviews?page=1&limit=100${status === 'ALL' ? '' : `&status=${status}`}`)
      .then((result) => setItems(result.items))
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Reviews could not be loaded.'))
      .finally(() => setLoading(false))
  }, [status])

  async function moderate(item: Review, next: 'APPROVED' | 'REJECTED') {
    const reason = window.prompt(next === 'APPROVED' ? 'Moderation note (optional):' : 'Reason for rejection:', next === 'APPROVED' ? 'Review meets community guidelines' : 'Review violates community guidelines')
    if (reason === null) return
    try {
      await apiClient(`/api/admin/reviews/${item.id}/moderate`, { method: 'PATCH', body: JSON.stringify({ status: next, reason: reason || undefined }) })
      if (status === 'ALL') setItems((current) => current.map((value) => value.id === item.id ? { ...value, status: next } : value))
      else setItems((current) => current.filter((value) => value.id !== item.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Review could not be moderated.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Review Management" description="Moderate reviews stored in the production database." />
      <div className="flex flex-wrap gap-2">{reviewStatuses.map((value) => <button key={value} onClick={() => { setLoading(true); setStatus(value) }} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === value ? 'bg-[#01AEAD] text-white' : 'bg-white text-slate-600'}`}>{statusLabels[value]}</button>)}</div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4">
        {items.map((item) => <Card key={item.id} className="p-5"><div className="flex flex-col gap-4 md:flex-row md:items-start"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold text-black">{item.title || `${item.rating}-star review`}</h2><span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="size-4 fill-current" />{item.rating}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{statusLabels[item.status]}</span></div><p className="mt-2 text-sm text-muted-foreground">{item.comment}</p>{item.disputeReason && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><strong>Vet dispute reason:</strong> {item.disputeReason}</div>}<p className="mt-3 text-xs text-muted-foreground">{item.user.firstName} {item.user.lastName} &middot; {item.practice.name} &middot; {new Date(item.createdAt).toLocaleDateString('en-GB')}{item.disputedAt ? <> &middot; Disputed {new Date(item.disputedAt).toLocaleDateString('en-GB')}</> : null}</p></div>{(item.status === 'PENDING' || item.status === 'DISPUTED') && <div className="flex gap-2"><button onClick={() => void moderate(item, 'REJECTED')} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-300 px-3 text-sm font-semibold text-red-700"><X className="size-4" />{item.status === 'DISPUTED' ? 'Reject review' : 'Reject'}</button><button onClick={() => void moderate(item, 'APPROVED')} className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white"><Check className="size-4" />{item.status === 'DISPUTED' ? 'Keep review' : 'Approve'}</button></div>}</div></Card>)}
        {!loading && !items.length && <Card className="p-8 text-center text-sm text-muted-foreground">No reviews in this queue.</Card>}
        {loading && <p className="text-center text-sm text-muted-foreground">Loading reviews...</p>}
      </div>
    </div>
  )
}
