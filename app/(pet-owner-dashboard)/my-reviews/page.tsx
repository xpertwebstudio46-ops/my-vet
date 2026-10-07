'use client'

import { FormEvent, useEffect, useState } from 'react'
import { MessageSquare, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Card, PageHeader, Rating } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated, Practice } from '@/lib/api/types'

type Review = {
  id: string
  rating: number
  title: string | null
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED'
  reply: string | null
  repliedAt: string | null
  createdAt: string
  practice: { id: string; name: string; slug: string }
}

type ReviewDraft = {
  practiceId: string
  rating: number
  title: string
  comment: string
}

const emptyReviewDraft: ReviewDraft = {
  practiceId: '',
  rating: 0,
  title: '',
  comment: '',
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [editing, setEditing] = useState<Review | null>(null)
  const [draft, setDraft] = useState({ rating: 5, title: '', comment: '' })
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addDraft, setAddDraft] = useState<ReviewDraft>(emptyReviewDraft)
  const [practices, setPractices] = useState<Practice[]>([])
  const [practicesLoading, setPracticesLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Review[]>('/api/reviews/me')
      .then(setReviews)
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Reviews could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(review: Review) {
    setEditing(review)
    setDraft({ rating: review.rating, title: review.title ?? '', comment: review.comment })
  }

  async function openAddModal() {
    setAddOpen(true)
    if (practices.length) return

    setPracticesLoading(true)
    setAddError('')

    try {
      const result = await apiClient<Paginated<Practice>>('/api/practices?page=1&limit=100&sort=rating', {}, { authenticated: false })
      setPractices(result.items)
    } catch (caught) {
      setAddError(caught instanceof ApiClientError ? caught.message : 'Practice options could not be loaded.')
    } finally {
      setPracticesLoading(false)
    }
  }

  async function saveEdit() {
    if (!editing) return

    try {
      const updated = await apiClient<Review>(`/api/reviews/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          rating: draft.rating,
          title: draft.title || null,
          comment: draft.comment,
        }),
      })
      setReviews((current) => current.map((item) => (item.id === editing.id ? { ...item, ...updated } : item)))
      setEditing(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Review could not be updated.')
    }
  }

  async function deleteReview() {
    if (!deleting) return

    try {
      await apiClient(`/api/reviews/${deleting.id}`, { method: 'DELETE' })
      setReviews((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Review could not be deleted.')
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!addDraft.practiceId || addDraft.rating === 0 || addDraft.comment.trim().length < 10) return

    setAddLoading(true)
    setAddError('')
    setAddSuccess('')

    try {
      const created = await apiClient<Omit<Review, 'practice'>>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          practiceId: addDraft.practiceId,
          rating: addDraft.rating,
          title: addDraft.title || null,
          comment: addDraft.comment,
        }),
      })
      const practice = practices.find((item) => item.id === addDraft.practiceId)
      setReviews((current) => [
        {
          ...created,
          practice: {
            id: addDraft.practiceId,
            name: practice?.name ?? 'Selected practice',
            slug: practice?.slug ?? '',
          },
        },
        ...current,
      ])
      setAddSuccess('Your review was submitted and is awaiting moderation.')
      setAddDraft(emptyReviewDraft)
    } catch (caught) {
      setAddError(caught instanceof ApiClientError ? caught.message : 'The review could not be submitted.')
    } finally {
      setAddLoading(false)
    }
  }

  function closeAddModal() {
    setAddOpen(false)
    setAddDraft(emptyReviewDraft)
    setAddError('')
    setAddSuccess('')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="My reviews" description="Reviews you have left for practices. Honest feedback helps other owners choose.">
        <button
          type="button"
          onClick={() => void openAddModal()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
        >
          <Plus className="size-4" />
          Add Review
        </button>
      </PageHeader>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading reviews...</Card>
      ) : !reviews.length ? (
        <EmptyState icon={MessageSquare} title="You haven't left any reviews yet" description="Add a review for a practice you have visited." />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-black">{review.practice.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{review.status}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <Rating value={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(review.createdAt))}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(review)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium">
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleting(review)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-red-600">
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              {review.title && <p className="mt-3 font-semibold">{review.title}</p>}
              <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
              {review.reply && (
                <div className="mt-4 rounded-xl border-l-2 border-brand bg-[#E4E0D6] p-3">
                  <p className="text-xs font-semibold text-[#7B8A87]">Reply from {review.practice.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{review.reply}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={closeAddModal} title="Add a review" description="Share your experience with a veterinary practice." className="max-w-xl">
        {addSuccess ? (
          <div>
            <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{addSuccess}</p>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={closeAddModal} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => void submitReview(event)} className="grid gap-4">
            <label className="text-sm font-medium">
              My Vet Practice
              <select
                required
                value={addDraft.practiceId}
                onChange={(event) => setAddDraft({ ...addDraft, practiceId: event.target.value })}
                className="mt-2 h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">{practicesLoading ? 'Loading practices...' : 'Choose My Vet Practice'}</option>
                {practices.map((practice) => (
                  <option key={practice.id} value={practice.id}>
                    {practice.name} - {practice.city}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Your Rating
              <span className="mt-2 flex gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1
                  return (
                    <button key={value} type="button" onClick={() => setAddDraft({ ...addDraft, rating: value })} aria-label={`Rate ${value} stars`}>
                      <Star className={value <= addDraft.rating ? 'size-7 fill-warning text-warning' : 'size-7 text-slate-300'} />
                    </button>
                  )
                })}
              </span>
            </label>
            <label className="text-sm font-medium">
              Title (optional)
              <input
                value={addDraft.title}
                maxLength={120}
                onChange={(event) => setAddDraft({ ...addDraft, title: event.target.value })}
                placeholder="Review title (optional)"
                className="mt-2 h-10 w-full rounded-md border px-3 text-sm"
              />
            </label>
            <label className="text-sm font-medium">
              Your review
              <textarea
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                value={addDraft.comment}
                onChange={(event) => setAddDraft({ ...addDraft, comment: event.target.value })}
                placeholder="Share your experience..."
                className="mt-2 w-full resize-none rounded-md border p-3 text-sm"
              />
            </label>
            {addError && <p role="alert" className="text-sm text-red-600">{addError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeAddModal} className="h-10 rounded-md border px-4 text-sm font-semibold">
                Cancel
              </button>
              <button
                disabled={addLoading || practicesLoading || !addDraft.practiceId || addDraft.rating === 0 || addDraft.comment.trim().length < 10}
                className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {addLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit your review" description={editing.practice.name}>
          <div className="grid gap-4">
            <label className="text-sm font-medium">
              Rating
              <span className="mt-2 flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <button key={index} type="button" onClick={() => setDraft({ ...draft, rating: index + 1 })} aria-label={`${index + 1} stars`}>
                    <Star className={index < draft.rating ? 'size-7 fill-warning text-warning' : 'size-7 text-slate-300'} />
                  </button>
                ))}
              </span>
            </label>
            <label className="text-sm font-medium">
              Title (optional)
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3" />
            </label>
            <label className="text-sm font-medium">
              Your review
              <textarea required minLength={10} rows={5} value={draft.comment} onChange={(event) => setDraft({ ...draft, comment: event.target.value })} className="mt-2 w-full rounded-md border p-3" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">
                Cancel
              </button>
              <button type="button" disabled={draft.comment.trim().length < 10} onClick={() => void saveEdit()} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50">
                Save changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal open onClose={() => setDeleting(null)} title="Delete this review?" description="This action cannot be undone.">
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">
              Cancel
            </button>
            <button type="button" onClick={() => void deleteReview()} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">
              Delete review
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
