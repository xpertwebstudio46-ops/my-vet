'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiClientError } from '@/lib/api/client'

export function RequireVetPractice({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { void apiClient('/api/vet/dashboard').then(() => setReady(true)).catch((caught) => { if (caught instanceof ApiClientError && caught.code === 'PRACTICE_NOT_FOUND') router.replace('/register-practice'); else setError(caught instanceof Error ? caught.message : 'Practice could not be loaded.') }) }, [router])
  if (error) return <div role="alert" className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-red-700">{error}</div>
  if (!ready) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Loading your practice...</div>
  return children
}
