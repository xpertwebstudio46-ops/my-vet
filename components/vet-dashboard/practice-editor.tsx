'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Practice = {
  id: string
  name: string
  description: string | null
  whatWeDo: string | null
  careOptions: string[]
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

const careOptions = [
  'Consultations',
  'Vaccinations',
  'Surgery',
  'Dental care',
  'Diagnostics',
  'Emergency care',
  'Microchipping',
  'Neutering',
  'Home visits',
  'Pet health plans',
]

export function PracticeEditor({ heading = 'Practice information', showEmergencyFields = false }: { heading?: string; showEmergencyFields?: boolean }) {
  const [practice, setPractice] = useState<Practice | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newCareOption, setNewCareOption] = useState('')
  const [editingCareOption, setEditingCareOption] = useState<string | null>(null)
  const [editingCareOptionValue, setEditingCareOptionValue] = useState('')

  useEffect(() => {
    void apiClient<{ practice: Practice }>('/api/vet/dashboard')
      .then((result) => setPractice({ ...result.practice, careOptions: result.practice.careOptions ?? [] }))
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
            whatWeDo: practice.whatWeDo,
            careOptions: practice.careOptions,
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
  const availableCareOptions = [...careOptions, ...practice.careOptions.filter((option) => !careOptions.includes(option))]
  const toggleCareOption = (option: string) => setPractice({
    ...practice,
    careOptions: practice.careOptions.includes(option)
      ? practice.careOptions.filter((value) => value !== option)
      : [...practice.careOptions, option],
  })
  const addCareOption = () => {
    const option = newCareOption.trim()
    if (!option || practice.careOptions.some((value) => value.toLowerCase() === option.toLowerCase())) return
    setPractice({ ...practice, careOptions: [...practice.careOptions, option] })
    setNewCareOption('')
  }
  const startEditingCareOption = (option: string) => {
    setEditingCareOption(option)
    setEditingCareOptionValue(option)
  }
  const saveCareOptionEdit = () => {
    if (!editingCareOption) return
    const option = editingCareOptionValue.trim()
    if (!option) return
    setPractice({
      ...practice,
      careOptions: practice.careOptions.map((value) => value === editingCareOption ? option : value).filter((value, index, values) => values.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index),
    })
    setEditingCareOption(null)
    setEditingCareOptionValue('')
  }
  const removeCareOption = (option: string) => {
    setPractice({ ...practice, careOptions: practice.careOptions.filter((value) => value !== option) })
    if (editingCareOption === option) {
      setEditingCareOption(null)
      setEditingCareOptionValue('')
    }
  }

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
          About the practice
          <textarea value={practice.description ?? ''} onChange={(event) => set('description', event.target.value || null)} rows={6} className="mt-2 w-full rounded-md border p-3 text-sm" />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          What we do
          <textarea value={practice.whatWeDo ?? ''} onChange={(event) => set('whatWeDo', event.target.value || null)} rows={5} className="mt-2 w-full rounded-md border p-3 text-sm" />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Care offered</legend>
          <div className="mt-2 max-h-64 overflow-y-auto pr-2">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {availableCareOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <input type="checkbox" checked={practice.careOptions.includes(option)} onChange={() => toggleCareOption(option)} className="size-4 accent-[#01AEAD]" />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input value={newCareOption} onChange={(event) => setNewCareOption(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCareOption() } }} placeholder="Add care offered" className="h-10 flex-1 rounded-md border px-3 text-sm" />
            <button type="button" onClick={addCareOption} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold"><Plus className="size-4" />Add</button>
          </div>
          {!!practice.careOptions.length && (
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-2">
              {practice.careOptions.map((option) => (
                <div key={option} className="flex flex-col gap-2 rounded-md border bg-slate-50 p-2 sm:flex-row sm:items-center">
                  {editingCareOption === option ? (
                    <input value={editingCareOptionValue} onChange={(event) => setEditingCareOptionValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); saveCareOptionEdit() } }} className="h-9 flex-1 rounded-md border bg-white px-3 text-sm" />
                  ) : (
                    <span className="flex-1 px-1 text-sm font-medium">{option}</span>
                  )}
                  <div className="flex gap-1">
                    {editingCareOption === option ? (
                      <>
                        <button type="button" onClick={saveCareOptionEdit} aria-label={`Save ${option}`} className="rounded-md p-2 text-emerald-700 hover:bg-white"><Check className="size-4" /></button>
                        <button type="button" onClick={() => { setEditingCareOption(null); setEditingCareOptionValue('') }} aria-label={`Cancel editing ${option}`} className="rounded-md p-2 text-slate-600 hover:bg-white"><X className="size-4" /></button>
                      </>
                    ) : (
                      <button type="button" onClick={() => startEditingCareOption(option)} aria-label={`Edit ${option}`} className="rounded-md p-2 text-[#064071] hover:bg-white"><Pencil className="size-4" /></button>
                    )}
                    <button type="button" onClick={() => removeCareOption(option)} aria-label={`Remove ${option}`} className="rounded-md p-2 text-red-600 hover:bg-white"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>
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
