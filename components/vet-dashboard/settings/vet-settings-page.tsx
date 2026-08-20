'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { DeleteAccountModal } from './delete-account-modal'

type Profile = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}

const blank: Profile = { firstName: '', lastName: '', email: '', phone: null, language: 'en', emailNotifications: true, pushNotifications: true, marketingEmails: false }

export function VetSettingsPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<Profile>(blank)
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Profile>('/api/users/me/profile').then(setProfile).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Settings could not be loaded.'))
  }, [])

  async function saveSettings() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await Promise.all([
        apiClient('/api/users/me/profile', { method: 'PUT', body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone }) }),
        apiClient('/api/users/me/preferences', { method: 'PUT', body: JSON.stringify({ language: profile.language, emailNotifications: profile.emailNotifications, pushNotifications: profile.pushNotifications, marketingEmails: profile.marketingEmails }) }),
      ])
      setMessage('Account settings saved.')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Settings could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword() {
    setError('')
    setMessage('')
    if (password.newPassword !== password.confirm) { setError('New passwords do not match.'); return }
    try {
      await apiClient('/api/users/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword: password.currentPassword, newPassword: password.newPassword }) })
      setPassword({ currentPassword: '', newPassword: '', confirm: '' })
      setMessage('Password updated. Other sessions have been signed out.')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Password could not be updated.')
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    setError('')
    try {
      await apiClient('/api/users/me', { method: 'DELETE' })
      await logout()
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'The account could not be deleted.')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Account Settings" description="Update your profile, notification preferences and account security.">
        <button type="button" disabled={saving} onClick={() => void saveSettings()} className="h-11 rounded-md bg-[#064071] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save settings'}</button>
      </PageHeader>
      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="grid gap-4 p-6">
          <h2 className="text-lg font-semibold text-black">Account profile</h2>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })} /><Input label="Last name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })} /></div>
          <Input label="Login email" type="email" value={profile.email} readOnly />
          <Input label="Phone number" type="tel" value={profile.phone ?? ''} onChange={(value) => setProfile({ ...profile, phone: value || null })} />
          <label className="text-sm font-medium text-black">Dashboard language<select value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm"><option value="en">English</option><option value="cy">Welsh</option></select></label>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-black">Notifications</h2>
          <div className="mt-4 divide-y">{([
            ['emailNotifications', 'Email notifications', 'Appointment, review and account updates by email'],
            ['pushNotifications', 'Dashboard notifications', 'Real-time updates while signed in'],
            ['marketingEmails', 'Product news', 'Tips, features and My Vet announcements'],
          ] as const).map(([key, title, description]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><span className="block text-sm font-medium text-black">{title}</span><span className="block text-xs text-muted-foreground">{description}</span></span><input type="checkbox" checked={profile[key]} onChange={(event) => setProfile({ ...profile, [key]: event.target.checked })} className="size-4 accent-[#01AEAD]" /></label>)}</div>
        </Card>

        <Card className="grid gap-4 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-black">Change password</h2>
          <p className="text-sm text-muted-foreground">Use at least 10 characters with uppercase, lowercase and a number.</p>
          <div className="grid gap-4 md:grid-cols-3"><Input label="Current password" type="password" value={password.currentPassword} onChange={(value) => setPassword({ ...password, currentPassword: value })} /><Input label="New password" type="password" value={password.newPassword} onChange={(value) => setPassword({ ...password, newPassword: value })} /><Input label="Confirm new password" type="password" value={password.confirm} onChange={(value) => setPassword({ ...password, confirm: value })} /></div>
          <button type="button" onClick={() => void updatePassword()} className="h-10 w-fit rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071]">Update password</button>
        </Card>
      </div>

      <Card className="border-red-200 p-6"><h2 className="text-lg font-semibold text-red-600">Delete vet account</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">This archives your practice, revokes every session and permanently removes access to this account.</p><button type="button" onClick={() => setDeleteOpen(true)} className="mt-4 h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">Delete account</button></Card>
      {deleteOpen && <DeleteAccountModal deleting={deleting} onDelete={() => void deleteAccount()} onClose={() => setDeleteOpen(false)} />}
    </div>
  )
}

function Input({ label, value, onChange, readOnly, type = 'text' }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean; type?: string }) {
  return <label className="text-sm font-medium text-black">{label}<input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none read-only:bg-slate-50 focus:border-[#01AEAD]" /></label>
}
