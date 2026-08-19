'use client'

import { useState } from 'react'
import { PlanCard } from './plan-card'
import type { SubscriptionPlan } from './subscription-types'

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '\u00a30',
    description: 'Basic listing visibility with limited profile controls.',
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: '\u00a349',
    description: 'Enhanced listing tools, review replies and performance insights.',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '\u00a3129',
    description: 'Advanced visibility, featured listing access and priority support.',
  },
]

export function CurrentPlanCard() {
  const [activePlan, setActivePlan] = useState('professional')

  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Current plan</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Choose the plan that matches how you want owners to find your practice.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            active={activePlan === plan.id}
            onSelect={() => setActivePlan(plan.id)}
          />
        ))}
      </div>
    </section>
  )
}
