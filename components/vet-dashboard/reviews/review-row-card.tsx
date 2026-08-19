import Image from 'next/image'
import { Flag, MessageSquareReply } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import type { VetReview } from './data'
import { ReviewStars } from './review-stars'

export function ReviewRowCard({ review }: { review: VetReview }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
          <Image
            src={review.image}
            alt={review.reviewer}
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-black">
                {review.reviewer}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ReviewStars value={review.rating} />
                <span className="text-xs font-semibold text-black">
                  {review.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {review.date}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {review.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
            >
              <MessageSquareReply className="size-4 text-slate-400" />
              Reply
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
            >
              <Flag className="size-4 text-slate-400" />
              Report review
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
