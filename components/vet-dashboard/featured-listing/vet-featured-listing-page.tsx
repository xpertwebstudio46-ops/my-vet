import {
  Eye,
  MailQuestion,
  MousePointerClick,
} from 'lucide-react'
import { BoostPlansCard } from './boost-plans-card'
import { FeaturedBenefitsCard } from './featured-benefits-card'
import { FeaturedListingBanner } from './featured-listing-banner'
import { FeaturedStatCard } from './featured-stat-card'
import type { FeaturedStat } from './featured-listing-types'

const stats: FeaturedStat[] = [
  {
    label: 'Featured impressions',
    value: '12.8k',
    icon: Eye,
  },
  {
    label: 'Click-through rate',
    value: '8.4%',
    icon: MousePointerClick,
  },
  {
    label: 'Enquiries from boost',
    value: '46',
    icon: MailQuestion,
  },
]

export function VetFeaturedListingPage() {
  return (
    <div className="space-y-6">
      <FeaturedListingBanner />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <FeaturedStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <BoostPlansCard />
        <FeaturedBenefitsCard />
      </div>
    </div>
  )
}
