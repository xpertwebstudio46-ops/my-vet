'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Pencil, Star, Trash2 } from 'lucide-react'
import { Card, PageHeader, Rating } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Review = { id: string; rating: number; title: string | null; comment: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; reply: string | null; repliedAt: string | null; createdAt: string; practice: { id: string; name: string; slug: string } }

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [editing, setEditing] = useState<Review | null>(null)
  const [draft, setDraft] = useState({ rating: 5, title: '', comment: '' })
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { void apiClient<Review[]>('/api/reviews/me').then(setReviews).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Reviews could not be loaded.')).finally(() => setLoading(false)) }, [])

  function startEdit(review: Review) { setEditing(review); setDraft({ rating: review.rating, title: review.title ?? '', comment: review.comment }) }
  async function saveEdit() {
    if (!editing) return
    try { const updated = await apiClient<Review>(`/api/reviews/${editing.id}`, { method: 'PUT', body: JSON.stringify({ rating: draft.rating, title: draft.title || null, comment: draft.comment }) }); setReviews((current) => current.map((item) => item.id === editing.id ? { ...item, ...updated } : item)); setEditing(null) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Review could not be updated.') }
  }
  async function deleteReview() {
    if (!deleting) return
    try { await apiClient(`/api/reviews/${deleting.id}`, { method: 'DELETE' }); setReviews((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Review could not be deleted.') }
  }

  return <div className="mx-auto max-w-7xl"><PageHeader title="My reviews" description="Reviews you have left for practices. Honest feedback helps other owners choose." />{error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading ? <Card className="p-8 text-center text-sm text-muted-foreground">Loading reviews...</Card> : !reviews.length ? <EmptyState icon={MessageSquare} title="You haven't left any reviews yet" description="After a completed appointment, open the practice profile to share your experience." /> : <div className="flex flex-col gap-4">{reviews.map((review) => <Card key={review.id} className="p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-black">{review.practice.name}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{review.status}</span></div><div className="mt-1 flex items-center gap-3"><Rating value={review.rating} /><span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(review.createdAt))}</span></div></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(review)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium"><Pencil className="size-3.5" />Edit</button><button type="button" onClick={() => setDeleting(review)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-red-600"><Trash2 className="size-3.5" />Delete</button></div></div>{review.title && <p className="mt-3 font-semibold">{review.title}</p>}<p className="mt-2 text-sm leading-relaxed">{review.comment}</p>{review.reply && <div className="mt-4 rounded-xl border-l-2 border-brand bg-[#E4E0D6] p-3"><p className="text-xs font-semibold text-[#7B8A87]">Reply from {review.practice.name}</p><p className="mt-1 text-sm text-muted-foreground">{review.reply}</p></div>}</Card>)}</div>}{editing && <Modal open onClose={() => setEditing(null)} title="Edit your review" description={editing.practice.name}><div className="grid gap-4"><label className="text-sm font-medium">Rating<span className="mt-2 flex gap-1">{Array.from({ length: 5 }, (_, index) => <button key={index} type="button" onClick={() => setDraft({ ...draft, rating: index + 1 })} aria-label={`${index + 1} stars`}><Star className={index < draft.rating ? 'size-7 fill-warning text-warning' : 'size-7 text-slate-300'} /></button>)}</span></label><label className="text-sm font-medium">Title (optional)<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3" /></label><label className="text-sm font-medium">Your review<textarea required minLength={10} rows={5} value={draft.comment} onChange={(event) => setDraft({ ...draft, comment: event.target.value })} className="mt-2 w-full rounded-md border p-3" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button type="button" disabled={draft.comment.trim().length < 10} onClick={() => void saveEdit()} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50">Save changes</button></div></div></Modal>}{deleting && <Modal open onClose={() => setDeleting(null)} title="Delete this review?" description="This action cannot be undone."><div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleting(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void deleteReview()} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">Delete review</button></div></Modal>}</div>
}
