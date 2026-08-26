import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StayConnectedSection from '@/components/contact/ContactForm'
import { getSubscriptionPlans } from '@/lib/api/server'

export default async function EnquirePage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const params = await searchParams
  const rawPlan = Array.isArray(params.plan) ? params.plan[0] : params.plan
  const plans = await getSubscriptionPlans().catch(() => [])
  const selectedPlan = rawPlan ? plans.find((plan) => plan.slug === rawPlan) : undefined
  const planLabel = selectedPlan?.name ?? 'Membership'
  return <><section className="bg-[#064071] px-4 pb-20 pt-6"><Header /><div className="mx-auto mt-20 max-w-4xl text-center"><p className="text-sm font-semibold uppercase tracking-widest text-[#13b8a8]">{planLabel} plan</p><h1 className="mt-3 text-5xl font-bold text-white">Talk to us about growing your practice</h1><p className="mx-auto mt-4 max-w-2xl text-blue-100">Send your details and the MY VET team will reply with onboarding, pricing and next steps.</p></div></section><StayConnectedSection initialSubject={`${planLabel} plan enquiry`} /><Footer /></>
}
