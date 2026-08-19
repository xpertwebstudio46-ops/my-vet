import Image from 'next/image'
import { Check, Star, Trash2 } from 'lucide-react'

export type ReviewStatus = 'Pending' | 'Reported' | 'Published'

export type ReviewManagementItem = {
  id: string
  reviewer: string
  image: string
  practice: string
  rating: number
  date: string
  status: ReviewStatus
  body: string
}

const statusStyles: Record<ReviewStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Reported: 'bg-red-50 text-red-600',
  Published: 'bg-[#EEF7F5] text-[#01AEAD]',
}

export function ReviewCard({
  review,
  onApprove,
  onRemove,
}: {
  review: ReviewManagementItem
  onApprove: () => void
  onRemove: () => void
}) {
  return (
    <div className="grid gap-4 border-b border-gray-200/80 p-5 last:border-b-0 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
            <Image
              src={review.image}
              alt={review.reviewer}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-sm font-semibold text-black">
                {review.reviewer}
              </h2>
              <p className="text-sm text-muted-foreground">
                reviewed <span className="font-semibold text-[#064071]">{review.practice}</span>
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < Math.round(review.rating)
                        ? 'fill-warning text-warning'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-black">
                {review.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">{review.date}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[review.status]}`}
              >
                {review.status}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {review.body}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 xl:justify-end">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          <Check className="size-4" />
          Approve
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-500 bg-transparent px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          Remove
        </button>
        <button
          type="button"
          disabled
          className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-md border border-gray-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
        >
          Contact author
        </button>
      </div>
    </div>
  )
}
