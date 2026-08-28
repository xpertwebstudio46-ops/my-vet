'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, ShieldCheck, X } from 'lucide-react'
import {
  formatPlanPrice,
  groupPlans,
  independentPlans,
  type BillingCycle,
  type MembershipPlan,
  type MembershipType,
} from '@/lib/membership-plans'

type FeatureValue = boolean | string
type FeatureSection = {
  title: string
  rows: Array<{ label: string; values: FeatureValue[] }>
}

const independentFeatures: FeatureSection[] = [
  {
    title: 'Profile & listing',
    rows: [
      { label: 'Practice profile page', values: [true, true, true] },
      { label: 'Postcode / map search', values: [true, true, true] },
      { label: 'Opening hours displayed', values: [true, true, true] },
      { label: 'Species treated listed', values: ['Up to 3', 'Unlimited', 'Unlimited'] },
      { label: 'Photo gallery', values: ['Up to 5', 'Up to 15', 'Unlimited'] },
      { label: 'Practice video embed', values: [false, false, true] },
      { label: 'Out-of-hours information', values: [true, true, true] },
      { label: 'Team profiles', values: [false, 'Up to 5', 'Unlimited'] },
      { label: 'Featured / top placement', values: [false, false, true] },
    ],
  },
  {
    title: 'Trust & verification',
    rows: [
      { label: 'RCVS accreditation badge', values: [true, true, true] },
      { label: 'Specialist certifications', values: [false, true, true] },
      { label: 'Collect & display reviews', values: [true, true, true] },
      { label: 'Respond to reviews publicly', values: [false, true, true] },
      { label: 'Flag & dispute reviews', values: [false, true, true] },
      { label: 'Quality indicator badge', values: [false, false, true] },
    ],
  },
  {
    title: 'Appointments & leads',
    rows: [
      { label: 'Online appointment request form', values: [false, true, true] },
      { label: 'Direct pet-owner enquiries', values: [true, true, true] },
      { label: 'Enquiry lead dashboard', values: ['Basic', 'Full', 'Full'] },
      { label: 'New patient registration link', values: [false, true, true] },
      { label: 'Emergency / OOH referral listed', values: [true, true, true] },
    ],
  },
  {
    title: 'Jobs & recruitment',
    rows: [
      { label: 'Job vacancy postings', values: ['Up to 2', 'Up to 5', 'Unlimited'] },
      { label: 'Applicant management tool', values: [false, false, true] },
      { label: 'Filter applicants by RCVS registration', values: [false, false, true] },
    ],
  },
  {
    title: 'Analytics & support',
    rows: [
      { label: 'Profile views & click analytics', values: ['Basic', 'Full', 'Full + monthly report'] },
      { label: 'Competitor benchmarking', values: [false, false, true] },
      { label: 'Customer support', values: ['Email only', 'Email & chat', 'Priority + phone'] },
      { label: 'Onboarding assistance', values: [false, true, true] },
    ],
  },
]

const groupFeatures: FeatureSection[] = [
  {
    title: 'Group profile & branding',
    rows: [
      { label: 'Group brand landing page', values: [true, true, true, true] },
      { label: 'Individual branch profiles', values: ['Up to 5', 'Up to 20', 'Up to 50', 'Unlimited'] },
      { label: 'Postcode / map search per branch', values: [true, true, true, true] },
      { label: 'Photo gallery per branch', values: ['Up to 10', 'Up to 20', 'Unlimited', 'Unlimited'] },
      { label: 'Team profiles per branch', values: [false, 'Up to 5', 'Unlimited', 'Unlimited'] },
      { label: 'Group-level featured placement', values: [false, false, true, true] },
      { label: 'Top-of-search across all branches', values: [false, false, false, true] },
      { label: 'Homepage carousel slot', values: [false, false, true, true] },
    ],
  },
  {
    title: 'Trust & verification',
    rows: [
      { label: 'RCVS accreditation badges', values: [true, true, true, true] },
      { label: 'Specialist certificates per branch', values: [false, true, true, true] },
      { label: 'Review collection per branch', values: [true, true, true, true] },
      { label: 'Respond to reviews publicly', values: [true, true, true, true] },
      { label: 'Flag & dispute reviews', values: [true, true, true, true] },
      { label: 'Group review summary dashboard', values: [false, 'Basic', 'Full', 'Full'] },
    ],
  },
  {
    title: 'Appointments & leads',
    rows: [
      { label: 'Online appointment request per branch', values: [false, true, true, true] },
      { label: 'Centralised lead dashboard', values: ['Basic', 'Full', 'Full', 'Full'] },
      { label: 'New patient links per branch', values: [false, true, true, true] },
      { label: 'OOH referral network listed', values: [true, true, true, true] },
    ],
  },
  {
    title: 'Jobs & recruitment',
    rows: [
      { label: 'Group-wide job postings', values: ['Up to 5', 'Up to 20', 'Unlimited', 'Unlimited'] },
      { label: 'Centralised applicant dashboard', values: [false, true, true, true] },
      { label: 'Filter applicants by RCVS registration', values: [false, true, true, true] },
      { label: 'ATS / HR system integration', values: [false, false, true, true] },
      { label: 'API access', values: [false, false, false, true] },
    ],
  },
  {
    title: 'Analytics & support',
    rows: [
      { label: 'Per-branch analytics', values: ['Basic', 'Full', 'Full', 'Full'] },
      { label: 'Group-wide performance report', values: ['Monthly', 'Monthly', 'Monthly', 'Weekly'] },
      { label: 'Competitor benchmarking', values: [false, false, true, true] },
      { label: 'Dedicated account manager', values: [false, false, true, true] },
      { label: 'Onboarding & setup support', values: ['Email', 'Full', 'Full', 'Full'] },
      { label: 'SLA response time', values: ['48hr', '24hr', '4hr', '1hr'] },
    ],
  },
]

export default function PricingPlans() {
  const [membership, setMembership] = useState<MembershipType>('independent')
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const plans = membership === 'independent' ? independentPlans : groupPlans

  return (
    <section id="pricing" className="relative isolate w-full overflow-hidden bg-[#052f55] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-10" style={{ backgroundImage: "url('/images/bg.png')", backgroundPosition: 'center', backgroundSize: 'cover' }} />
      <PawPrint size={150} className="pointer-events-none absolute -left-8 top-16 -z-10 text-white opacity-[0.06]" />
      <PawPrint size={110} className="pointer-events-none absolute -right-5 bottom-20 -z-10 text-white opacity-[0.06]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4de0d3]">Practice memberships</p>
          <h2 className="mt-4 font-display text-[32px] font-extrabold leading-tight text-white sm:text-[40px]">
            Choose how your practice <span className="text-[#4de0d3]">grows</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100">
            Every listing is a paid membership. Choose a plan for one independent practice or volume pricing for a multi-site vet group.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-[#4de0d3]/30 bg-[#4de0d3]/10 p-4 text-left text-white sm:items-center sm:px-5">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-[#4de0d3] sm:mt-0" aria-hidden="true" />
          <p className="text-sm leading-6"><strong>Launch offer: your first 6 months are free</strong> on every plan. No card is required to start.</p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 lg:flex-row">
          <div className="grid w-full max-w-xl grid-cols-2 rounded-full border border-white/15 bg-white/10 p-1" role="tablist" aria-label="Membership type">
            <MembershipTab active={membership === 'independent'} onClick={() => setMembership('independent')}>Independent practice</MembershipTab>
            <MembershipTab active={membership === 'group'} onClick={() => setMembership('group')}>Vet group</MembershipTab>
          </div>
          <div className="flex rounded-full border border-white/15 bg-white/10 p-1" aria-label="Billing frequency">
            <BillingButton active={billing === 'monthly'} onClick={() => setBilling('monthly')}>Monthly</BillingButton>
            <BillingButton active={billing === 'annual'} onClick={() => setBilling('annual')}>Annual <span className="text-[10px] font-bold uppercase tracking-wide text-[#4de0d3]">Save</span></BillingButton>
          </div>
        </div>

        <div className={`mt-10 grid gap-5 ${membership === 'independent' ? 'lg:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
          {plans.map((plan) => <PlanCard key={`${plan.membership}-${plan.slug}`} plan={plan} billing={billing} />)}
        </div>

        <FeatureComparison
          plans={plans}
          sections={membership === 'independent' ? independentFeatures : groupFeatures}
          billing={billing}
        />

        <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-5 text-blue-200">
          Prices include VAT. Independent annual billing saves two months. Vet-group annual billing includes a further 10% discount on volume pricing. Enterprise terms, white-label options and integration support are agreed on application.
        </p>
      </div>
    </section>
  )
}

function MembershipTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-sm font-semibold transition-colors sm:text-base ${active ? 'bg-white text-[#052f55] shadow-sm' : 'text-blue-100 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

function BillingButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-white text-[#052f55]' : 'text-blue-100 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

function PlanCard({ plan, billing }: { plan: MembershipPlan; billing: BillingCycle }) {
  const enterprise = plan.membership === 'group' && plan.slug === 'enterprise'
  const price = formatPlanPrice(plan, billing)
  const href = enterprise
    ? `/enquire?membership=group&plan=enterprise&billing=${billing}`
    : `/register?role=vet&membership=${plan.membership}&plan=${plan.slug}&billing=${billing}`

  return (
    <article className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-xl shadow-black/10 ${plan.popular ? 'border-[#4de0d3] bg-white ring-2 ring-[#4de0d3]/30' : 'border-white/15 bg-white/[0.08]'}`}>
      {plan.popular && <span className="absolute -top-3 left-6 rounded-full bg-[#13b8a8] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most popular</span>}
      <p className={`text-xs font-semibold uppercase tracking-widest ${plan.popular ? 'text-[#078a83]' : 'text-[#4de0d3]'}`}>{plan.audience}</p>
      <h3 className={`mt-2 font-display text-3xl font-bold ${plan.popular ? 'text-[#052f55]' : 'text-white'}`}>{plan.name}</h3>
      <p className={`mt-3 min-h-16 text-sm leading-6 ${plan.popular ? 'text-slate-600' : 'text-blue-100'}`}>{plan.description}</p>

      <div className="mt-5">
        <div className="flex items-end gap-1">
          <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-[#052f55]' : 'text-white'}`}>{price}</span>
          {price !== 'Custom' && <span className={`pb-1 text-xs ${plan.popular ? 'text-slate-500' : 'text-blue-200'}`}>/ {plan.priceUnit}</span>}
        </div>
        <p className={`mt-1 text-xs ${plan.popular ? 'text-slate-500' : 'text-blue-200'}`}>
          {billing === 'monthly' ? 'per month, VAT included' : price === 'Custom' ? 'Bespoke annual agreement' : 'per year, VAT included'}
        </p>
        <p className={`mt-2 min-h-5 text-xs font-semibold ${plan.popular ? 'text-[#078a83]' : 'text-[#4de0d3]'}`}>
          {billing === 'annual' ? (plan.membership === 'independent' ? 'Two months included free' : price === 'Custom' ? 'Tailored to your group' : 'Extra 10% annual discount') : 'First 6 months free'}
        </p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.highlights.map((feature) => (
          <li key={feature} className={`flex gap-2.5 text-sm leading-5 ${plan.popular ? 'text-slate-700' : 'text-blue-100'}`}>
            <Check className="mt-0.5 size-4 shrink-0 text-[#13b8a8]" strokeWidth={2.5} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${plan.popular ? 'bg-[#13b8a8] text-white' : 'bg-white text-[#052f55]'}`}
      >
        {enterprise ? 'Request enterprise plan' : 'Start 6 months free'}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
      {!enterprise && <p className={`mt-3 text-center text-[11px] ${plan.popular ? 'text-slate-500' : 'text-blue-200'}`}>No card required</p>}
    </article>
  )
}

function FeatureComparison({ plans, sections, billing }: { plans: MembershipPlan[]; sections: FeatureSection[]; billing: BillingCycle }) {
  return (
    <details className="group mt-10 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07]">
      <summary className="flex list-none cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-white marker:content-none sm:px-7">
        <span>Compare every feature</span>
        <ChevronDown className="size-5 shrink-0 text-[#4de0d3] transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="overflow-x-auto border-t border-white/10">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#032846] text-white">
              <th scope="col" className="sticky left-0 z-10 min-w-56 bg-[#032846] px-5 py-4 font-semibold">Feature</th>
              {plans.map((plan) => (
                <th scope="col" key={plan.slug} className="min-w-36 px-4 py-4 text-center">
                  <span className="block font-semibold">{plan.name}</span>
                  <span className="mt-1 block text-[11px] font-normal text-blue-200">{formatPlanPrice(plan, billing)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <FeatureRows key={section.title} section={section} columnCount={plans.length} />
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function FeatureRows({ section, columnCount }: { section: FeatureSection; columnCount: number }) {
  return (
    <>
      <tr>
        <th colSpan={columnCount + 1} className="bg-[#13b8a8]/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#70f2e8]">{section.title}</th>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.label} className="border-t border-white/10 text-blue-50">
          <th scope="row" className="sticky left-0 bg-[#123c5e] px-5 py-3.5 font-medium">{row.label}</th>
          {row.values.map((value, index) => <FeatureCell key={`${row.label}-${index}`} value={value} />)}
        </tr>
      ))}
    </>
  )
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <td className="px-4 py-3.5 text-center"><Check className="mx-auto size-4 text-[#4de0d3]" strokeWidth={2.5} aria-label="Included" /></td>
  if (value === false) return <td className="px-4 py-3.5 text-center"><X className="mx-auto size-4 text-blue-300/40" aria-label="Not included" /></td>
  return <td className="px-4 py-3.5 text-center text-xs text-blue-100">{value}</td>
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
