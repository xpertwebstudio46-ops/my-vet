'use client'

import { useState } from 'react'
import { MessageSquare, Pencil, Star, Trash2 } from 'lucide-react'
import { reviews as initialReviews, type Review } from '@/lib/dashboard-data'
import { Card, PageHeader, Rating } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [editing, setEditing] = useState<Review | null>(null)
  const [draft, setDraft] = useState({ rating: 5, body: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function startEdit(review: Review) {
    setEditing(review)
    setDraft({ rating: review.rating, body: review.body })
  }

  function saveEdit() {
    if (!editing) return
    setReviews((prev) =>
      prev.map((r) =>
        r.id === editing.id
          ? { ...r, rating: draft.rating, body: draft.body }
          : r,
      ),
    )
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="My reviews"
        description="Reviews you have left for practices. Honest feedback helps other owners choose."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="You haven't left any reviews yet"
          description="After your next visit, share your experience to help fellow pet owners."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="dashboard-outfit text-lg font-semibold text-black">
                    {review.practice}
                  </h3>
                  <div className="mt-1 flex items-center gap-3">
                    <Rating value={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(review)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(review.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-[#C85A38] transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {review.body}
              </p>

              {review.reply && (
                <div className="mt-4 rounded-xl border-l-2 border-brand bg-[#E4E0D6] p-3">
                  <p className=" dashboard-font text-xs font-semibold text-[#7B8A87]">
                    Reply from {review.practice}
                  </p>
                  <p className="mt-1 text-sm dashboard-font font-normal  text-muted-foreground">
                    {review.reply}
                  </p>
                </div>
              )}

              {/* <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ThumbsUp className="size-3.5" />
                {review.helpful} people found this helpful
              </div> */}
            </Card>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit your review"
        description={editing?.practice}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium">Rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, rating: i + 1 }))}
                  aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
                >
                  <Star
                    className={
                      i < draft.rating
                        ? 'size-7 fill-warning text-warning'
                        : 'size-7 fill-muted text-muted'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="review-body"
              className="mb-1.5 block text-sm font-medium"
            >
              Your review
            </label>
            <textarea
              id="review-body"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={5}
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete this review?"
        description="This action cannot be undone. Your review will be permanently removed."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setReviews((prev) => prev.filter((r) => r.id !== deleteId))
              setDeleteId(null)
            }}
          >
            Delete review
          </Button>
        </div>
      </Modal>
    </div>
  )
}
