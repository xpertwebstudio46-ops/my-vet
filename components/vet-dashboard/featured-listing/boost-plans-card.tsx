'use client'

import { useState } from 'react'
import { BoostPlanCard } from './boost-plan-card'
import type { BoostPlan } from './featured-listing-types'

const boostPlans: BoostPlan[] = [
  {
    id: 'seven-days',
    name: '7 days plan',
    price: '\u00a329',
    tag: 'Try it out',
    description: 'Short visibility boost for testing local owner response.',
  },
  {
    id: 'thirty-days',
    name: '30 days plan',
    price: '\u00a379',
    tag: 'Save 18%',
    description: 'A full month of featured placement across search and emails.',
  },
  {
    id: 'ninety-days',
    name: '90 days plan',
    price: '\u00a3199',
    tag: 'Best value',
    description: 'Quarterly promotion with longer visibility and stronger reach.',
  },
]

export function BoostPlansCard() {
  const [selectedPlan, setSelectedPlan] = useState('thirty-days')

  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Extend or upgrade</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Choose a featured listing boost length for your practice.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        {boostPlans.map((plan) => (
          <BoostPlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>
    </section>
  )
}
