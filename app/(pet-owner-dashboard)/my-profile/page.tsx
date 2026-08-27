'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Camera, Save } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'

type Profile = { id: string; email: string; firstName: string; lastName: string; phone: string | null; address: string | null; avatar: string | null }
type Pet = { id: string; name: string; species: string; breed: string | null; imageAssetId: string | null; imageAsset: { id: string; url: string } | null }
type PetDraft = Pick<Pet, 'id' | 'name' | 'species' | 'breed'>

function Field({ label, value, onChange, type = 'text', readOnly = false }: { label: string; value: string; onChange?: (value: string) => void; type?: string; readOnly?: boolean }) {
  return <label className="block text-sm font-medium text-black">{label}<input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none read-only:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring" /></label>
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '' })
  const [avatarFile, setAvatarFile] = useState<File>()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [petDrafts, setPetDrafts] = useState<PetDraft[]>([])
  const [petsModalOpen, setPetsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void Promise.all([apiClient<Profile>('/api/users/me/profile'), apiClient<Pet[]>('/api/pets')])
      .then(([user, petItems]) => { setProfile(user); setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '', address: user.address ?? '' }); setPets(petItems) })
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Your profile could not be loaded.'))
  }, [])

  useEffect(() => () => { if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview) }, [avatarPreview])

  async function saveProfile() {
    setSaving(true); setError('')
    const asset = avatarFile ? await uploadImage(avatarFile, 'AVATAR').catch((caught) => { setError(caught instanceof ApiClientError ? caught.message : 'Avatar upload failed.'); return null }) : null
    if (avatarFile && !asset) { setSaving(false); return }
    try {
      const updated = await apiClient<Profile>('/api/users/me/profile', { method: 'PUT', body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, phone: form.phone || null, address: form.address || null, ...(asset ? { avatarAssetId: asset.id } : {}) }) })
      setProfile(updated); setAvatarFile(undefined); setAvatarPreview(null)
      window.dispatchEvent(new CustomEvent('myvet:user-updated', { detail: updated }))
    } catch (caught) {
      if (asset) await discardUpload(asset)
      setError(caught instanceof ApiClientError ? caught.message : 'Profile could not be saved.')
    } finally { setSaving(false) }
  }

  function openPetsModal() { setPetDrafts(pets.map(({ id, name, species, breed }) => ({ id, name, species, breed }))); setPetsModalOpen(true) }
  function updatePet(id: string, key: 'name' | 'species' | 'breed', value: string) { setPetDrafts((current) => current.map((pet) => pet.id === id ? { ...pet, [key]: value } : pet)) }

  async function savePetDetails() {
    setSaving(true); setError('')
    try {
      const updated = await Promise.all(petDrafts.map((pet) => apiClient<Pet>(`/api/pets/${pet.id}`, { method: 'PUT', body: JSON.stringify({ name: pet.name, species: pet.species, breed: pet.breed || null }) })))
      setPets((current) => current.map((pet) => updated.find((item) => item.id === pet.id) ?? pet)); setPetsModalOpen(false)
    } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Pet details could not be saved.') }
    finally { setSaving(false) }
  }

  async function replacePetPhoto(petId: string, file: File) {
    setError('')
    let asset
    try {
      asset = await uploadImage(file, 'PET')
      const updated = await apiClient<Pet>(`/api/pets/${petId}`, { method: 'PUT', body: JSON.stringify({ imageAssetId: asset.id }) })
      setPets((current) => current.map((pet) => pet.id === petId ? updated : pet))
    } catch (caught) {
      if (asset) await discardUpload(asset)
      setError(caught instanceof ApiClientError ? caught.message : 'Pet photo could not be saved.')
    }
  }

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your profile'
  const avatar = avatarPreview ?? profile?.avatar ?? null

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10">
      <div className='max-sm:flex-col'>
        <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">My profile</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Your details are shared with a practice only when you send an enquiry or book.</p>
      </div>
        <Button onClick={() => void saveProfile()} disabled={saving || !profile} className="inline-flex items-center justify-center gap-2 bg-[#064071] p-5 text-brand-foreground"><Save className="size-4" />{saving ? 'Saving...' : 'Save changes'}</Button></div>
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6"><h2 className="dashboard-outfit text-[16px] font-semibold">Personal details</h2><div className="mt-5 flex items-center gap-4"><label className="relative cursor-pointer">{avatar ? <Image src={avatar} alt={displayName} width={72} height={72} unoptimized={avatar.startsWith('blob:')} className="size-18 rounded-full object-cover" /> : <UserAvatar name={displayName} className="size-18 text-xl" />}<span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md"><Camera className="size-3.5" /></span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) } }} /></label><div><p className="dashboard-outfit text-[16px] font-semibold">{displayName}</p><p className="text-sm text-muted-foreground">JPG, PNG or WebP, max 8MB</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="First name" value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} /><Field label="Last name" value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} /><Field label="Email address" type="email" value={profile?.email ?? ''} readOnly /><Field label="Phone number" type="tel" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} /><div className="sm:col-span-2"><Field label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} /></div></div></Card>
        <Card className="p-6"><h2 className="dashboard-outfit text-[16px] font-semibold">My pets</h2><ul className="mt-5 flex flex-col gap-3">{pets.map((pet) => <li key={pet.id} className="flex items-center gap-3 rounded-xl border border-border p-3"><Image src={pet.imageAsset?.url || '/placeholder.svg'} alt={pet.name} width={48} height={48} className="size-12 rounded-full object-cover" /><div><p className="font-semibold">{pet.name}</p><p className="text-xs text-muted-foreground">{pet.species}{pet.breed ? ` - ${pet.breed}` : ''}</p></div></li>)}</ul><Button variant="outline" size="sm" className="mt-4 w-full" onClick={openPetsModal}>Edit details and photos</Button></Card>
      </div>
      <Modal open={petsModalOpen} onClose={() => setPetsModalOpen(false)} title="Edit pet details" description="Changes and photos are stored on your pet records." className="max-w-2xl"><div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">{petDrafts.map((pet) => { const savedPet = pets.find((item) => item.id === pet.id); return <div key={pet.id} className="rounded-xl border border-border p-4"><div className="mb-4 flex items-center gap-3"><label className="relative cursor-pointer"><Image src={savedPet?.imageAsset?.url || '/placeholder.svg'} alt={pet.name} width={52} height={52} className="size-13 rounded-full object-cover" /><span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-brand text-white"><Camera className="size-3" /></span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void replacePetPhoto(pet.id, file) }} /></label><p className="dashboard-outfit text-[16px] font-semibold text-primary">{pet.name}</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Name" value={pet.name} onChange={(value) => updatePet(pet.id, 'name', value)} /><Field label="Species" value={pet.species} onChange={(value) => updatePet(pet.id, 'species', value)} /><Field label="Breed" value={pet.breed ?? ''} onChange={(value) => updatePet(pet.id, 'breed', value)} /></div></div> })}</div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" size="lg" onClick={() => setPetsModalOpen(false)}>Cancel</Button><Button size="lg" disabled={saving} className="bg-[#064071] text-white hover:bg-[#05365f]" onClick={() => void savePetDetails()}>{saving ? 'Saving...' : 'Save details'}</Button></div></Modal>
    </div>
  )
}
