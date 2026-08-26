export type MembershipType = 'independent' | 'group'
export type BillingCycle = 'monthly' | 'annual'

export type MembershipPlan = {
  slug: string
  membership: MembershipType
  name: string
  audience: string
  description: string
  monthlyPrice: number | null
  annualPrice: number | null
  priceUnit: string
  popular?: boolean
  highlights: string[]
}

export const independentPlans: MembershipPlan[] = [
  {
    slug: 'essential',
    membership: 'independent',
    name: 'Essential',
    audience: 'Single-site practices',
    description: 'Build a trusted, searchable presence for your practice.',
    monthlyPrice: 29,
    annualPrice: 290,
    priceUnit: 'practice',
    highlights: [
      'Full practice profile and map listing',
      'Up to 3 species and 5 photos',
      'Collect and display client reviews',
      'Direct pet-owner enquiries',
      'Up to 2 job vacancy posts',
      'Basic lead and profile analytics',
    ],
  },
  {
    slug: 'standard',
    membership: 'independent',
    name: 'Standard',
    audience: 'Growing practices',
    description: 'Turn more searches into appointments with a richer profile.',
    monthlyPrice: 59,
    annualPrice: 590,
    priceUnit: 'practice',
    popular: true,
    highlights: [
      'Everything in Essential',
      'Unlimited species and up to 15 photos',
      'Team profiles and specialist credentials',
      'Online appointment requests',
      'Respond to and dispute reviews',
      'Full analytics and onboarding support',
    ],
  },
  {
    slug: 'premium',
    membership: 'independent',
    name: 'Premium',
    audience: 'High-growth practices',
    description: 'Lead local search and unlock the complete growth toolkit.',
    monthlyPrice: 99,
    annualPrice: 990,
    priceUnit: 'practice',
    highlights: [
      'Everything in Standard',
      'Featured placement and quality badge',
      'Unlimited gallery and team profiles',
      'Video, jobs and applicant management',
      'Competitor benchmarking',
      'Priority email and phone support',
    ],
  },
]

export const groupPlans: MembershipPlan[] = [
  {
    slug: 'starter',
    membership: 'group',
    name: 'Starter',
    audience: '2–5 branches',
    description: 'One group presence with the essentials for every branch.',
    monthlyPrice: 89,
    annualPrice: 960,
    priceUnit: 'branch',
    highlights: [
      'Group landing page',
      'Up to 5 branch profiles',
      'Reviews for every branch',
      'Basic centralised lead dashboard',
      'Up to 5 group-wide job posts',
      'Monthly performance report',
    ],
  },
  {
    slug: 'growth',
    membership: 'group',
    name: 'Growth',
    audience: '6–20 branches',
    description: 'Centralise leads, recruitment and reputation as you expand.',
    monthlyPrice: 69,
    annualPrice: 745,
    priceUnit: 'branch',
    popular: true,
    highlights: [
      'Up to 20 branch profiles',
      'Online appointment requests',
      'Full centralised lead dashboard',
      'Review summary dashboard',
      'Applicant dashboard and RCVS filters',
      'Full onboarding support',
    ],
  },
  {
    slug: 'scale',
    membership: 'group',
    name: 'Scale',
    audience: '21–50 branches',
    description: 'Maximise group visibility with unlimited growth tools.',
    monthlyPrice: 49,
    annualPrice: 530,
    priceUnit: 'branch',
    highlights: [
      'Up to 50 branch profiles',
      'Group featured placement',
      'Homepage carousel slot',
      'Unlimited job posts',
      'ATS and HR integrations',
      'Dedicated account manager',
    ],
  },
  {
    slug: 'enterprise',
    membership: 'group',
    name: 'Enterprise',
    audience: '51+ branches',
    description: 'A bespoke national solution with integration support.',
    monthlyPrice: 35,
    annualPrice: null,
    priceUnit: 'branch',
    highlights: [
      'Unlimited branch profiles',
      'Top-of-search across all branches',
      'API access and white-label options',
      'Weekly group performance reports',
      'Custom SLA agreements',
      'Dedicated integration support',
    ],
  },
]

export const membershipPlans = [...independentPlans, ...groupPlans]

export function getMembershipPlan(membership: string | undefined, slug: string | undefined) {
  if ((membership !== 'independent' && membership !== 'group') || !slug) return undefined
  return membershipPlans.find((plan) => plan.membership === membership && plan.slug === slug)
}

export function formatPlanPrice(plan: MembershipPlan, billing: BillingCycle) {
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
  if (price === null) return 'Custom'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}
