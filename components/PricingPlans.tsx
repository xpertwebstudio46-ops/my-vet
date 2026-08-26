import Link from 'next/link'
import { getSubscriptionPlans } from '@/lib/api/server'
import type { SubscriptionPlan } from '@/lib/api/types'

function featureList(features: unknown): string[] {
  if (Array.isArray(features)) return features.filter((feature): feature is string => typeof feature === 'string')
  if (features && typeof features === 'object' && 'items' in features) {
    const items = (features as { items?: unknown }).items
    return Array.isArray(items) ? items.filter((feature): feature is string => typeof feature === 'string') : []
  }
  return []
}

function formattedPrice(plan: SubscriptionPlan) {
  const value = Number(plan.price)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: plan.currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const PricingPlans = async () => {
  const plans = await getSubscriptionPlans().catch(() => [])

  return (
    <section
      className="relative w-full overflow-hidden px-6 pb-5 pt-10"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <PawPrint size={120} className="pointer-events-none absolute left-6 top-6 text-white opacity-10" />
      <PawPrint size={80} className="pointer-events-none absolute left-24 top-4 text-white opacity-[0.06]" />
      <PawPrint size={100} className="pointer-events-none absolute bottom-8 right-8 text-white opacity-10" />
      <PawPrint size={70} className="pointer-events-none absolute bottom-6 right-28 text-white opacity-[0.06]" />

      <div className="relative z-10 text-center">
        <h2 className="mb-3 font-display text-[48px] font-extrabold leading-tight text-white">
          Grow Your Veterinary <span className="text-[#13b8a8]">Practice</span> with My Vet
        </h2>
        <p className="mx-auto max-w-4xl font-sans text-[16px] font-normal leading-relaxed text-white">
          Join the UK&apos;s trusted veterinary directory and connect with thousands of pet owners actively looking for care.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="relative z-10 mx-auto my-14 max-w-xl rounded-2xl border border-white/25 bg-white/10 p-8 text-center text-blue-100">
          Subscription plans will be available soon.
        </p>
      ) : (
        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 pt-14 md:grid-cols-3">
          {plans.map((plan) => {
            const popular = plan.slug === 'professional'
            const features = featureList(plan.features)
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-7 ${popular ? 'md:-mt-4 md:mb-4' : ''}`}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  border: popular ? '2px solid #13b8a8' : '1px solid rgba(255,255,255,0.25)',
                }}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="whitespace-nowrap rounded-full bg-[#13b8a8] px-4 py-1.5 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className={`mb-2 font-display text-[28px] font-bold ${popular ? 'text-[#13b8a8]' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <p className="mb-5 min-h-20 font-sans text-[18px] font-light leading-relaxed text-blue-200">
                  {plan.description ?? 'Grow your practice with My Vet.'}
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-sans text-[32px] font-bold text-white">{formattedPrice(plan)}</span>
                  <span className="text-sm text-white">/per month</span>
                </div>
                <p className="-mt-5 mb-6 text-xs text-blue-100">VAT included</p>

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <svg className="size-4 shrink-0 text-[#13b8a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-sans text-[16px] font-normal text-blue-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/enquire?plan=${encodeURIComponent(plan.slug)}`}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3 font-sans text-sm font-normal transition-opacity hover:opacity-90 ${popular ? 'bg-[#13b8a8] text-white' : 'bg-white text-[#0d2e5e]'}`}
                >
                  Enquire Now
                  <img src="/images/arrow.png" alt="" className={`size-4 shrink-0 object-contain ${popular ? '' : 'invert'}`} aria-hidden="true" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function PawPrint({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="50" cy="72" rx="22" ry="18" />
      <ellipse cx="24" cy="46" rx="10" ry="13" transform="rotate(-15 24 46)" />
      <ellipse cx="40" cy="36" rx="10" ry="13" transform="rotate(-5 40 36)" />
      <ellipse cx="60" cy="36" rx="10" ry="13" transform="rotate(5 60 36)" />
      <ellipse cx="76" cy="46" rx="10" ry="13" transform="rotate(15 76 46)" />
    </svg>
  )
}

export default PricingPlans
