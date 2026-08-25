'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Modal } from '@/components/dashboard/modal'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type AccountProfile = {
  email: string
  phone: string | null
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void apiClient<AccountProfile>('/api/users/me/profile').then((data) => {
      setProfile(data)
      setPhone(data.phone ?? '')
      setLanguage(data.language)
      setEmailNotifications(data.emailNotifications)
      setPushNotifications(data.pushNotifications)
      setMarketingEmails(data.marketingEmails)
    }).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Account settings could not be loaded.'))
  }, [])

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      await Promise.all([
        apiClient('/api/users/me/profile', { method: 'PUT', body: JSON.stringify({ phone: phone.trim() || null }) }),
        apiClient('/api/users/me/preferences', { method: 'PUT', body: JSON.stringify({ language, emailNotifications, pushNotifications, marketingEmails }) }),
      ])
      setMessage('Account settings saved.')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Account settings could not be saved.')
    } finally { setSaving(false) }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('')
    if (newPassword !== confirmPassword) { setError('New password and confirmation do not match.'); return }
    setSaving(true)
    try {
      await apiClient('/api/users/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setMessage('Password updated. Please sign in again.')
      await logout().catch(() => undefined)
      router.replace('/login')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Password could not be updated.')
    } finally { setSaving(false) }
  }

  async function deleteAccount() {
    if (deleteText !== 'DELETE') return
    setSaving(true); setError('')
    try {
      await apiClient('/api/users/me', { method: 'DELETE' })
      await logout().catch(() => undefined)
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Account could not be deleted.')
      setConfirmDelete(false)
    } finally { setSaving(false) }
  }

  return <div className="mx-auto max-w-5xl">
    <PageHeader title="Account settings" description="Manage your contact details, preferences, password and account." />
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {message && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
    <form onSubmit={saveSettings} className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold text-[#064071]"><Settings className="size-5" />Contact details</h2><div className="mt-5 space-y-4"><Input label="Account email" type="email" value={profile?.email ?? ''} readOnly /><Input label="Phone number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /><label className="block text-sm font-medium">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 h-11 w-full rounded-xl border bg-white px-3"><option value="en">English (UK)</option><option value="en-GB">English (UK regional)</option><option value="en-US">English (US)</option></select></label></div></Card>
      <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold text-[#064071]"><Shield className="size-5" />Notification preferences</h2><div className="mt-5 space-y-4"><Preference label="Email notifications" description="Appointment and account updates by email" checked={emailNotifications} onChange={setEmailNotifications} /><Preference label="Push notifications" description="Live updates in your dashboard" checked={pushNotifications} onChange={setPushNotifications} /><Preference label="Marketing emails" description="MY VET news and partner updates" checked={marketingEmails} onChange={setMarketingEmails} /></div></Card>
      <div className="lg:col-span-2 flex justify-end"><button disabled={saving || !profile} className="h-11 rounded-lg bg-[#01AEAD] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save settings'}</button></div>
    </form>
    <Card className="mt-6 p-6"><h2 className="font-semibold text-[#064071]">Change password</h2><form onSubmit={changePassword} className="mt-5 grid gap-4 md:grid-cols-3"><Input required label="Current password" type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /><Input required minLength={10} label="New password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><Input required minLength={10} label="Confirm new password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><div className="flex flex-wrap gap-3 md:col-span-3"><button type="button" onClick={() => setShowPassword((current) => !current)} className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{showPassword ? 'Hide passwords' : 'Show passwords'}</button><button disabled={saving} className="h-10 rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">Update password</button></div></form></Card>
    <Card className="mt-6 border-red-200 p-6"><h2 className="font-semibold text-red-700">Delete account</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">This deactivates your account and removes access to appointments, saved practices and reviews.</p><button type="button" onClick={() => setConfirmDelete(true)} className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">Delete my account</button></Card>
    <Modal open={confirmDelete} onClose={() => { setConfirmDelete(false); setDeleteText('') }} title="Delete your account?" description="Type DELETE to confirm. This cannot be undone."><input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} placeholder="Type DELETE" className="h-11 w-full rounded-xl border px-3" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmDelete(false)} className="h-10 rounded-lg border px-4 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void deleteAccount()} disabled={saving || deleteText !== 'DELETE'} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Deleting...' : 'Delete permanently'}</button></div></Modal>
  </div>
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm font-medium">{label}<input {...props} className="mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none read-only:bg-slate-50 focus:border-[#01AEAD]" /></label>
}

function Preference({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border p-4"><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-[#01AEAD]" /></label>
}
