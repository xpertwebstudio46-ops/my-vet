import { Card } from '@/components/dashboard/ui'
import { ratingSummary } from './data'
import { ReviewStars } from './review-stars'

export function RatingSummaryCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Rating summary
      </h2>

      <div className="mt-5 flex items-end gap-3">
        <p className="text-5xl font-bold leading-none text-black">
          {ratingSummary.rating.toFixed(1)}
        </p>
        <div className="pb-1">
          <ReviewStars value={ratingSummary.rating} sizeClass="size-5" />
          <p className="mt-1 text-sm text-muted-foreground">
            {ratingSummary.total} total reviews
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {ratingSummary.distribution.map((item) => (
          <div
            key={item.stars}
            className="grid grid-cols-[18px_minmax(0,1fr)_38px] items-center gap-3"
          >
            <span className="text-sm font-semibold text-black">
              {item.stars}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-warning"
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className="text-right text-xs font-semibold text-muted-foreground">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
