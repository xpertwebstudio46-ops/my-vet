import { AnalyticsBanner } from './analytics-banner'
import { AnalyticsStatCard } from './analytics-stat-card'
import { ContactActionsChart } from './contact-actions-chart'
import { analyticsStats } from './data'
import { MonthlyPerformanceTable } from './monthly-performance-table'
import { ProfileViewsChart } from './profile-views-chart'

export function VetAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsBanner />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {analyticsStats.map((stat) => (
          <AnalyticsStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <ProfileViewsChart />
        <ContactActionsChart />
      </section>

      <MonthlyPerformanceTable />
    </div>
  )
}
