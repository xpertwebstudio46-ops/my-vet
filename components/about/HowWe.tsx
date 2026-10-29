import Image from 'next/image'
import { Check, Search, ShieldCheck, Eye } from 'lucide-react'

const benefits = [
  'Verified veterinary practices',
  'Invite your Vet Practice',
  'Write and read genuine reviews from real pet owners',
  'Transparent vet prices and services',
  'Transparency on group-owned and independent vets',
  'Search by vet specialism: small animal, equine, farm and exotic vets',
  'Nationwide coverage across the UK',
  'Search by location, price and review, and save your favourite vet practice',
  'Easy side-by-side comparison of vets near you, by price, specialism and location',
];


const groups = [
  { title: 'A community you can trust', icon: ShieldCheck, items: benefits.slice(0, 3) },
  { title: 'Clear information. Confident choices.', icon: Eye, items: benefits.slice(3, 6) },
  { title: 'Your next vet, easier to find', icon: Search, items: benefits.slice(6) },
]

export default function HowWe() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold tracking-wide text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            How we help
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-[#064071] sm:text-4xl">
            Why Pet Owners and Vets Use My Vet
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Find, compare and connect with trusted veterinary practices near you.
          </p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="relative isolate min-h-[340px] overflow-hidden rounded-3xl bg-slate-100 sm:min-h-[440px] lg:min-h-[600px]">
            <Image
              src="/images/Picture1.png"
              alt="Veterinary team caring for a dog"
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#062c4e]/95 via-[#062c4e]/60 to-transparent px-6 pb-7 pt-24 sm:px-8 sm:pb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Better connected care</p>
              <p className="mt-3 max-w-xs font-heading text-2xl font-bold leading-snug text-white sm:text-3xl">
                Trusted practices.<br />Informed pet owners.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {groups.map(({ title, icon: Icon, items }) => (
              <div key={title} className="flex-1 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-teal-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold leading-snug text-[#064071] sm:text-lg">{title}</h3>
                </div>
                <ul className="space-y-3">
                  {items.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2.5} aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
