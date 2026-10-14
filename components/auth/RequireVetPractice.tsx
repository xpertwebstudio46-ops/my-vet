'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient, ApiClientError } from '@/lib/api/client'

export function RequireVetPractice({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [missingPractice, setMissingPractice] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void apiClient<{ practice: { id: string } | null }>('/api/vet/dashboard').then(({ practice }) => {
      if (!active) return
      if (practice) setReady(true)
      else setMissingPractice(true)
    }).catch((caught) => {
      if (!active) return
      if (caught instanceof ApiClientError && caught.code === 'PRACTICE_NOT_FOUND') setMissingPractice(true)
      else setError(caught instanceof Error ? caught.message : 'Practice could not be loaded.')
    })
    return () => { active = false }
  }, [])
  if (missingPractice) return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
      <h1 className="text-2xl font-bold text-[#064071]">Welcome to your vet account</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">Your account is ready. Add your practice to start managing its profile, appointments and services.</p>
      <Link href="/register-practice" className="mt-5 inline-flex rounded-lg bg-[#13b8a8] px-5 py-3 text-sm font-semibold text-white">Add your practice</Link>
    </section>
  )
  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
  if (!ready) return <div role="status" className="p-6 text-sm text-slate-600">Loading your practice...</div>
  return children
}
