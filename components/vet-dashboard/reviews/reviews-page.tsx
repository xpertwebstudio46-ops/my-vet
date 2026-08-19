import { RatingSummaryCard } from './rating-summary-card'
import { ReviewListCard } from './review-list-card'
import { ReviewsBanner } from './reviews-banner'

export function VetReviewsPage() {
  return (
    <div className="space-y-6">
      <ReviewsBanner />

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.38fr)_minmax(0,0.62fr)]">
        <RatingSummaryCard />
        <ReviewListCard />
      </section>
    </div>
  )
}
