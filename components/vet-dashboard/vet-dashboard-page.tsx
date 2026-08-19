import { LatestReviewCard } from './latest-review-card'
import { ProfileCompletionCard } from './profile-completion-card'
import { QuickActionsCard } from './quick-actions-card'
import { RecentEnquiriesCard } from './recent-enquiries-card'
import { VetDashboardBanner } from './vet-dashboard-banner'
import { VetStatCard } from './vet-stat-card'
import { vetStats } from './data'

export function VetDashboardPage() {
  return (
    <div className="space-y-6">
      <VetDashboardBanner />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {vetStats.map((stat) => (
          <VetStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <RecentEnquiriesCard />
        <div className="space-y-6">
          <ProfileCompletionCard />
          <QuickActionsCard />
          <LatestReviewCard />
        </div>
      </section>
    </div>
  )
}
