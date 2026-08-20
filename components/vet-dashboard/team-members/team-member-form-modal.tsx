'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { ApiClientError } from '@/lib/api/client'
import type { TeamMember, TeamMemberInput } from './team-member-types'

type TeamMemberFormModalProps = {
  member?: TeamMember | null
  onClose: () => void
  onSave: (member: TeamMemberInput) => Promise<void>
}

export function TeamMemberFormModal({
  member,
  onClose,
  onSave,
}: TeamMemberFormModalProps) {
  const [file, setFile] = useState<File>()
  const [image, setImage] = useState(member?.imageUrl ?? '/placeholder.svg')
  const [name, setName] = useState(member?.name ?? '')
  const [role, setRole] = useState(member?.role ?? '')
  const [bio, setBio] = useState(member?.bio ?? '')
  const [qualifications, setQualifications] = useState(member?.qualifications ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { if (image.startsWith('blob:')) URL.revokeObjectURL(image) }, [image])

  function handleImageChange(file?: File) {
    if (!file) return
    setFile(file)
    setImage(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), role: role.trim() || 'Veterinary surgeon', bio: bio.trim(), qualifications: qualifications.trim() || null, active: true, sortOrder: member?.sortOrder ?? 0, file })
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Team member could not be saved.')
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={member ? 'Edit team member' : 'Add team member'}
      className="max-w-2xl"
    >
      <div className="grid gap-4">
        <div>
          <p className="text-sm font-medium text-black">Image</p>
          <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
            <span className="relative size-16 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={image}
                alt="Team member preview"
                fill
                sizes="64px"
                unoptimized={image.startsWith('blob:')}
                className="object-cover"
              />
            </span>
            <span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]">
                <ImagePlus className="size-4 text-[#01AEAD]" />
                Upload image
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                PNG, JPG or WEBP image file
              </span>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TeamInput label="Name" value={name} onChange={setName} />
          <TeamInput label="Role" value={role} onChange={setRole} />
          <TeamInput label="Qualifications" value={qualifications} onChange={setQualifications} />
        </div>

        <label className="block text-sm font-medium text-black">
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          {saving ? 'Saving...' : 'Save member'}
        </button>
      </div>
    </Modal>
  )
}

function TeamInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
