import { Card } from '@/components/dashboard/ui'
import { FiveStarRating } from './five-star-rating'

export function LatestReviewCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Latest review
      </h2>
      <div className="mt-5 flex items-end gap-3">
        <p className="text-5xl font-bold leading-none text-black">4.8</p>
        <div className="pb-1">
          <FiveStarRating sizeClass="size-5" />
          <p className="mt-1 text-sm text-muted-foreground">
            Based on 186 reviews
          </p>
        </div>
      </div>
    </Card>
  )
}
