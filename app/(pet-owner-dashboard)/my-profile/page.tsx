'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Save } from 'lucide-react'
import { currentUser, pets } from '@/lib/dashboard-data'
import { Card } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-black">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

export default function MyProfilePage() {
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    phone: currentUser.phone,
    address: currentUser.address,
  })
  const [petProfiles, setPetProfiles] = useState(pets)
  const [petDrafts, setPetDrafts] = useState(pets)
  const [petsModalOpen, setPetsModalOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(key: keyof typeof form) {
    return (v: string) => {
      setForm((f) => ({ ...f, [key]: v }))
      setSaved(false)
    }
  }

  function updatePet(
    id: string,
    key: 'name' | 'type' | 'breed' | 'age',
    value: string,
  ) {
    setPetDrafts((drafts) =>
      drafts.map((pet) => (pet.id === id ? { ...pet, [key]: value } : pet)),
    )
  }

  function openPetsModal() {
    setPetDrafts(petProfiles)
    setPetsModalOpen(true)
  }

  function savePetDetails() {
    setPetProfiles(petDrafts)
    setPetsModalOpen(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex  items-center justify-between gap-4 rounded-2xl bg-white p-5  shadow-lg shadow-black/10">
        <div>
          <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">
            My profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Your details are shared with a practice only when you send an
            enquiry or book.
          </p>
        </div>
        <Button
          onClick={() => setSaved(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#064071] p-5 text-brand-foreground"
        >
          <Save className="size-4" />
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold ">
            Personal details
          </h2>

          <div className="mt-5 flex items-center gap-4">
            <div className="relative">
              <UserAvatar name={currentUser.fullName} className="size-18 text-xl" />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md"
                aria-label="Change photo"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <p className="font-semibold dashboard-outfit text-[16px]">{form.fullName}</p>
              <p className="text-sm text-muted-foreground">
                JPG or PNG, max 2MB
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              value={form.fullName}
              onChange={update('fullName')}
            />
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={update('email')}
            />
            <Field
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={update('phone')}
            />
            <Field
              label="Address"
              value={form.address}
              onChange={update('address')}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="dashboard-outfit  text-[16px] font-semibold">
            My pets
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {petProfiles.map((pet) => (
              <li
                key={pet.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <Image
                  src={pet.image || '/placeholder.svg'}
                  alt={pet.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{pet.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pet.type} · {pet.breed} · {pet.age}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={openPetsModal}
          >
            Edit details
          </Button>
        </Card>
      </div>

      <Modal
        open={petsModalOpen}
        onClose={() => setPetsModalOpen(false)}
        title="Edit pet details"
        description="Update the profiles shown in your My pets card."
        className="max-w-2xl"
      >
        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          {petDrafts.map((pet) => (
            <div key={pet.id} className="rounded-xl border border-border p-4">
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src={pet.image || '/placeholder.svg'}
                  alt={pet.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                />
                <p className="dashboard-outfit text-[16px] font-semibold text-primary">
                  {pet.name}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={pet.name}
                  onChange={(value) => updatePet(pet.id, 'name', value)}
                />
                <Field
                  label="Type"
                  value={pet.type}
                  onChange={(value) => updatePet(pet.id, 'type', value)}
                />
                <Field
                  label="Breed"
                  value={pet.breed}
                  onChange={(value) => updatePet(pet.id, 'breed', value)}
                />
                <Field
                  label="Age"
                  value={pet.age}
                  onChange={(value) => updatePet(pet.id, 'age', value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPetsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="bg-[#064071] text-white hover:bg-[#05365f]"
            onClick={savePetDetails}
          >
            Save details
          </Button>
        </div>
      </Modal>
    </div>
  )
}
