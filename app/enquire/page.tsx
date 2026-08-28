import Footer from '@/components/Footer'
import StayConnectedSection from '@/components/contact/ContactForm'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import { getSubscriptionPlans } from '@/lib/api/server'
import { getMembershipPlan } from '@/lib/membership-plans'

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function EnquirePage({ searchParams }: { searchParams: Promise<{ plan?: string | string[]; membership?: string | string[]; billing?: string | string[] }> }) {
  const params = await searchParams
  const rawPlan = queryValue(params.plan)
  const membershipPlan = getMembershipPlan(queryValue(params.membership), rawPlan)
  const plans = await getSubscriptionPlans().catch(() => [])
  const selectedPlan = rawPlan ? plans.find((plan) => plan.slug === rawPlan) : undefined
  const planLabel = membershipPlan?.name ?? selectedPlan?.name ?? 'Membership'
  const enterprise = membershipPlan?.membership === 'group' && membershipPlan.slug === 'enterprise'

  return (
    <>
      <PublicHeroBanner
        title={enterprise ? 'Build your enterprise membership' : 'Talk to us about growing your practice'}
        description={enterprise ? 'Tell us about your group size and integration needs. We will prepare your volume pricing, onboarding plan and SLA.' : 'Send your details and the MY VET team will reply with onboarding, pricing and next steps.'}
      />
      <StayConnectedSection initialSubject={`${planLabel} plan enquiry`} />
      <Footer />
    </>
  )
}
