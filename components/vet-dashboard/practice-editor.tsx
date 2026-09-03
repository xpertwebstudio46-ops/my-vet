'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Practice = {
  id: string
  name: string
  description: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  county: string | null
  postcode: string
  phone: string
  email: string
  website: string | null
  timezone: string
  emergencyNumber: string | null
  emergencyCalloutAddress: string | null
}

export function PracticeEditor({ heading = 'Practice information', showEmergencyFields = false }: { heading?: string; showEmergencyFields?: boolean }) {
  const [practice, setPractice] = useState<Practice | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void apiClient<{ practice: Practice }>('/api/vet/dashboard')
      .then((result) => setPractice(result.practice))
      .catch((caught) =>
        setError(caught instanceof ApiClientError ? caught.message : 'Practice could not be loaded.'),
      )
  }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!practice) return
    setError('')
    setMessage('')
    try {
      const saved = await apiClient<Omit<Practice, 'emergencyNumber' | 'emergencyCalloutAddress'>>(
        `/api/practices/${practice.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: practice.name,
            description: practice.description,
            addressLine1: practice.addressLine1,
            addressLine2: practice.addressLine2,
            city: practice.city,
            county: practice.county,
            postcode: practice.postcode,
            phone: practice.phone,
            email: practice.email,
            website: practice.website,
            timezone: practice.timezone,
          }),
        },
      )
      if (showEmergencyFields) {
        await apiClient('/api/vet/emergency-hours', {
          method: 'PUT',
          body: JSON.stringify({
            phone: practice.emergencyNumber || null,
            calloutAddress: practice.emergencyCalloutAddress || null,
          }),
        })
      }
      setPractice((current) => current ? { ...current, ...saved } : current)
      window.dispatchEvent(new CustomEvent('myvet:practice-updated', { detail: saved }))
      setMessage('Practice information saved and published to your listing.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Practice could not be saved.')
    }
  }

  if (!practice) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">{error || 'Loading practice information...'}</Card>
  }

  const set = (key: keyof Practice, value: string | null) => setPractice({ ...practice, [key]: value })

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="dashboard-outfit text-xl font-semibold">{heading}</h2>
        <button className="rounded-md bg-[#01AEAD] px-4 py-2.5 text-sm font-semibold text-white">Save changes</button>
      </div>
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Practice name" value={practice.name} onChange={(value) => set('name', value)} />
        <Field label="Email" type="email" value={practice.email} onChange={(value) => set('email', value)} />
        <Field label="Phone" value={practice.phone} onChange={(value) => set('phone', value)} />
        <Field label="Website" type="url" value={practice.website ?? ''} onChange={(value) => set('website', value || null)} />
        <Field label="Address line 1" value={practice.addressLine1} onChange={(value) => set('addressLine1', value)} />
        <Field label="Address line 2" value={practice.addressLine2 ?? ''} onChange={(value) => set('addressLine2', value || null)} />
        <Field label="City" value={practice.city} onChange={(value) => set('city', value)} />
        <Field label="County" value={practice.county ?? ''} onChange={(value) => set('county', value || null)} />
        <Field label="Postcode" value={practice.postcode} onChange={(value) => set('postcode', value)} />
        <Field label="Timezone" value={practice.timezone} onChange={(value) => set('timezone', value)} />
        {showEmergencyFields && (
          <>
            <Field label="Emergency number" value={practice.emergencyNumber ?? ''} onChange={(value) => set('emergencyNumber', value || null)} />
            <Field label="Emergency callout address" value={practice.emergencyCalloutAddress ?? ''} onChange={(value) => set('emergencyCalloutAddress', value || null)} />
          </>
        )}
        <label className="text-sm font-medium sm:col-span-2">
          Description
          <textarea value={practice.description ?? ''} onChange={(event) => set('description', event.target.value || null)} rows={6} className="mt-2 w-full rounded-md border p-3 text-sm" />
        </label>
      </Card>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input required={['Practice name', 'Email', 'Phone', 'Address line 1', 'City', 'Postcode'].includes(label)} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" />
    </label>
  )
}
