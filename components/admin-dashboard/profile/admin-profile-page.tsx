'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { AdminPageBanner } from '../shared/admin-page-banner'

type Profile = { firstName: string; lastName: string; email: string; phone: string | null; bio: string | null }

export function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { void apiClient<Profile>('/api/users/me/profile').then(setProfile).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Profile could not be loaded.')) }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!profile) return
    setSaving(true); setError(''); setMessage('')
    try {
      const updated = await apiClient<Profile>('/api/users/me/profile', { method: 'PUT', body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || null, bio: profile.bio || null }) })
      setProfile(updated)
      window.dispatchEvent(new CustomEvent('myvet:user-updated', { detail: updated }))
      setMessage('Profile saved.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Profile could not be saved.') } finally { setSaving(false) }
  }

  return <div className="space-y-6"><AdminPageBanner title="Administrator Profile" description="Your personal administrator identity and contact details." />{message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{profile ? <form onSubmit={(event) => void save(event)}><Card className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2"><Input label="First name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })} /><Input label="Last name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })} /><Input label="Email" type="email" value={profile.email} readOnly /><Input label="Phone" value={profile.phone ?? ''} onChange={(value) => setProfile({ ...profile, phone: value || null })} /><label className="sm:col-span-2 text-sm font-medium">Bio<textarea rows={5} value={profile.bio ?? ''} onChange={(event) => setProfile({ ...profile, bio: event.target.value || null })} className="mt-2 w-full rounded-md border p-3 text-sm" /></label><div className="sm:col-span-2"><button disabled={saving} className="h-10 rounded-md bg-[#01AEAD] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save profile'}</button></div></Card></form> : !error && <Card className="p-8 text-sm text-muted-foreground">Loading profile...</Card>}</div>
}

function Input({ label, value, onChange, type = 'text', readOnly = false }: { label: string; value: string; onChange?: (value: string) => void; type?: string; readOnly?: boolean }) {
  return <label className="text-sm font-medium">{label}<input required={!readOnly} readOnly={readOnly} type={type} value={value} onChange={(event) => onChange?.(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm read-only:bg-slate-50" /></label>
}
