import { Check } from 'lucide-react'

const benefits = [
  'Top of search results for your town',
  'Featured badge on your listing card',
  'Priority placement in the "Recommended vets" panel',
  'Highlighted in owner email digests',
]

export function FeaturedBenefitsCard() {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">What you get</h2>
      </div>

      <ul className="mt-5 grid gap-4">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#01AEAD] text-white">
              <Check className="size-4" />
            </span>
            <span className="text-sm leading-6 text-muted-foreground">
              {benefit}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
