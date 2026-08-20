'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/components/auth/AuthProvider'
import Footer from '@/components/Footer'
import PracticeDetailsForm, { type PracticeDetailsFormData } from '@/components/registerPractice/PracticeDetailsForm'
import RegisterHero from '@/components/registerPractice/RegisterHero'
import FaqSection from '@/components/registerPractice/faq'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Practice } from '@/lib/api/types'

export default function RegisterPracticePage() {
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
      <section className="my-20 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl sm:px-6">
          <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <h2 className="text-xl font-semibold text-[#064071]">Submit your practice for approval</h2>
            <p className="mt-1 text-sm text-slate-600">Registration is free while billing is being finalized. After submission, you can complete your dashboard while an administrator reviews the listing.</p>
          </div>
          <PracticeDetailsForm onSubmit={handleFormSubmit} submitting={submitting} feedback={feedback} />
        </div>
      </section>
      <FaqSection />
      <Footer />
    </RequireAuth>
  )
}
