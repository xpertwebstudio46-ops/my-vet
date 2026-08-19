import { vetReviews } from './data'
import { ReviewRowCard } from './review-row-card'

export function ReviewListCard() {
  return (
    <div className="space-y-4">
      {vetReviews.map((review) => (
        <ReviewRowCard key={review.id} review={review} />
      ))}
    </div>
  )
}
