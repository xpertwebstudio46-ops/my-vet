import { CreditCard, PoundSterling, TrendingUp } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'

const stats = [
  {
    label: 'Subscribed practices',
    value: '186',
    icon: CreditCard,
  },
  {
    label: 'Monthly recurring revenue',
    value: '£24.8k',
    icon: PoundSterling,
  },
  {
    label: 'Free -> paid conversion',
    value: '18.4%',
    icon: TrendingUp,
  },
]

const plans = [
  {
    name: 'Free Plan',
    price: '£0',
    features: [
      'Basic practice profile',
      'Directory search visibility',
      'Owner contact information',
      'Limited review management',
    ],
  },
  {
    name: 'Professional Plan',
    price: '£49',
    features: [
      'Enhanced practice profile',
      'Priority directory placement',
      'Full review response tools',
      'Monthly performance insights',
    ],
  },
  {
    name: 'Premium Plan',
    price: '£129',
    features: [
      'Featured listing eligibility',
      'Advanced analytics dashboard',
      'Sponsor and boost options',
      'Dedicated account support',
    ],
  },
]

export function SubscriptionPlanPage() {
  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Subscription Plan"
        description="Review subscription health and manage pricing plan features."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-black">
                    {stat.value}
                  </p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF7F5] text-[#01AEAD]">
                  <Icon className="size-5" />
                </span>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col p-5">
            <div className="border-b border-gray-200/80 pb-5">
              <h2 className="dashboard-outfit text-[18px] font-semibold text-black">
                {plan.name}
              </h2>
              <p className="mt-4 text-4xl font-semibold text-[#064071]">
                {plan.price}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  / month
                </span>
              </p>
            </div>

            <ul className="flex-1 space-y-3 py-5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 size-2 rounded-full bg-[#01AEAD]" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
            >
              Edit plan features
            </button>
          </Card>
        ))}
      </section>
    </div>
  )
}
