'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

export type PracticeDetailsFormData = {
  practiceName: string
  veterinaryType: string
  addressLine1: string
  city: string
  postcode: string
  email: string
  phone: string
  website: string
}

type Props = {
  onSubmit?: (formData: PracticeDetailsFormData) => void | Promise<void>
  submitting?: boolean
  feedback?: { type: 'success' | 'error'; message: string } | null
}

const initialForm: PracticeDetailsFormData = { practiceName: '', veterinaryType: '', addressLine1: '', city: '', postcode: '', email: '', phone: '', website: '' }

export default function PracticeDetailsForm({ onSubmit, submitting = false, feedback = null }: Props) {
  const [formData, setFormData] = useState(initialForm)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit?.(formData)
  }

  const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500'
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-4xl font-bold text-[#064071]">Practice details</h2>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Practice name" required><input name="practiceName" value={formData.practiceName} onChange={handleChange} placeholder="e.g. Greenfield Vets" required className={inputClass} /></Field><Field label="Veterinary type" required><input name="veterinaryType" value={formData.veterinaryType} onChange={handleChange} placeholder="e.g. Small animal practice" required className={inputClass} /></Field></div>
        <Field label="Address line 1" required><input name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Street and building" required className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="City" required><input name="city" value={formData.city} onChange={handleChange} required className={inputClass} /></Field><Field label="Postcode" required><input name="postcode" value={formData.postcode} onChange={handleChange} required className={inputClass} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Email address" required><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@practice.com" required className={inputClass} /></Field><Field label="Phone number" required><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="01234 567890" required className={inputClass} /></Field></div>
        <Field label="Website URL"><input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.yourpractice.com" className={inputClass} /></Field>
        {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`text-sm ${feedback.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{feedback.message}</p>}
        <button type="submit" disabled={submitting} className="mt-2 w-full rounded-lg bg-teal-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit practice for approval'}</button>
        <p className="text-center text-xs text-slate-400">By completing this form you agree to our Terms of Service and Privacy Policy.</p>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-black">{label}{required ? ' *' : ''}<span className="mt-1 block">{children}</span></label>
}
