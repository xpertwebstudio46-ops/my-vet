'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/components/auth/AuthProvider'
import Footer from '@/components/Footer'
import PracticeDetailsForm, { type PracticeDetailsFormData } from '@/components/registerPractice/PracticeDetailsForm'
import RegisterHero from '@/components/registerPractice/RegisterHero'
import FaqSection from '@/components/registerPractice/faq'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Practice } from '@/lib/api/types'
import { formatPlanPrice, getMembershipPlan, type BillingCycle } from '@/lib/membership-plans'

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default function RegisterPracticePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = use(searchParams)
  const selectedPlan = getMembershipPlan(queryValue(params.membership), queryValue(params.plan))
  const billing: BillingCycle = queryValue(params.billing) === 'annual' ? 'annual' : 'monthly'
  const groupBranchRange = selectedPlan?.membership === 'group' ? {
    starter: { min: 2, max: 5 },
    growth: { min: 6, max: 20 },
    scale: { min: 21, max: 50 },
    enterprise: { min: 51 },
  }[selectedPlan.slug] : undefined
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  async function handleFormSubmit(formData: PracticeDetailsFormData) {
    if (!user || user.role !== 'VET') return
    setSubmitting(true)
    setFeedback(null)
    try {
      await apiClient<Practice>('/api/practices', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.practiceName,
          description: `Veterinary type: ${formData.veterinaryType}`,
          addressLine1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode,
          email: formData.email,
          phone: formData.phone,
          ...(formData.website ? { website: formData.website } : {}),
          ...(selectedPlan ? {
            membershipSelection: {
              membership: selectedPlan.membership,
              plan: selectedPlan.slug,
              billing,
              branchCount: selectedPlan.membership === 'group' ? Number(formData.branchCount) : 1,
            },
          } : {}),
        }),
      })
      setFeedback({ type: 'success', message: 'Practice submitted for admin approval. You can complete its profile in the dashboard.' })
      window.setTimeout(() => router.push('/vet-dashboard/practice-information'), 900)
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.code === 'PRACTICE_ALREADY_EXISTS') {
        router.replace('/vet-dashboard')
        return
      }
      setFeedback({ type: 'error', message: caught instanceof ApiClientError ? caught.message : 'The practice could not be submitted.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RequireAuth roles={['VET']}>
      <RegisterHero />
      <section className="my-12 bg-slate-50 px-4 py-10 sm:my-16 sm:px-6 sm:py-12 lg:my-20 lg:px-8">
        <div className="mx-auto max-w-3xl sm:px-6">
          <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <h2 className="text-xl font-semibold text-[#064071]">Submit your {selectedPlan?.membership === 'group' ? 'primary branch' : 'practice'} for approval</h2>
            {selectedPlan ? (
              <div className="mt-2 text-sm text-slate-600">
                <p>You selected <strong className="text-[#064071]">{selectedPlan.name}</strong> at {formatPlanPrice(selectedPlan, billing)} {billing === 'annual' ? 'per year' : 'per month'}{selectedPlan.membership === 'group' ? ', per branch' : ''}.</p>
                <p className="mt-1 font-medium text-[#087b75]">Your first 6 months are free and no card is required to start.</p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-600">After submission, you can complete your dashboard while an administrator reviews the listing.</p>
            )}
          </div>
          <PracticeDetailsForm onSubmit={handleFormSubmit} submitting={submitting} feedback={feedback} groupRegistration={selectedPlan?.membership === 'group'} groupBranchRange={groupBranchRange} />
        </div>
      </section>
      <FaqSection />
      <Footer />
    </RequireAuth>
  )
}
