'use client'

import Image from 'next/image'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { ApiClientError } from '@/lib/api/client'
import type { TeamMember, TeamMemberInput } from './team-member-types'

type TeamMemberFormModalProps = {
  member?: TeamMember | null
  onClose: () => void
  onSave: (members: TeamMemberInput[]) => Promise<void>
}

type TeamMemberDraft = {
  file?: File
  image: string
  name: string
  role: string
  bio: string
  qualifications: string[]
}

function splitQualifications(value?: string | null) {
  const items = value?.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) ?? []
  return items.length ? items : ['']
}

function createDraft(member?: TeamMember | null): TeamMemberDraft {
  return {
    image: member?.imageUrl ?? '/placeholder.svg',
    name: member?.name ?? '',
    role: member?.role ?? '',
    bio: member?.bio ?? '',
    qualifications: splitQualifications(member?.qualifications),
  }
}

function isEmptyDraft(draft: TeamMemberDraft) {
  return !draft.file && !draft.name.trim() && !draft.role.trim() && !draft.bio.trim() && draft.qualifications.every((item) => !item.trim())
}

function removeQualificationAt(qualifications: string[], index: number) {
  const next = qualifications.filter((_, itemIndex) => itemIndex !== index)
  return next.length ? next : ['']
}

export function TeamMemberFormModal({
  member,
  onClose,
  onSave,
}: TeamMemberFormModalProps) {
  const [drafts, setDrafts] = useState<TeamMemberDraft[]>(() => [createDraft(member)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const blobUrls = useRef<Set<string>>(new Set())

  useEffect(() => () => {
    blobUrls.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function updateDraft(index: number, patch: Partial<TeamMemberDraft>) {
    setDrafts((current) => current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...patch } : draft)))
  }

  function updateQualification(draftIndex: number, qualificationIndex: number, value: string) {
    setDrafts((current) => current.map((draft, index) => (
      index === draftIndex
        ? { ...draft, qualifications: draft.qualifications.map((qualification, itemIndex) => (itemIndex === qualificationIndex ? value : qualification)) }
        : draft
    )))
  }

  function addQualification(draftIndex: number) {
    setDrafts((current) => current.map((draft, index) => (index === draftIndex ? { ...draft, qualifications: [...draft.qualifications, ''] } : draft)))
  }

  function removeQualification(draftIndex: number, qualificationIndex: number) {
    setDrafts((current) => current.map((draft, index) => (
      index === draftIndex ? { ...draft, qualifications: removeQualificationAt(draft.qualifications, qualificationIndex) } : draft
    )))
  }

  function addMemberDraft() {
    setDrafts((current) => [...current, createDraft()])
  }

  function removeMemberDraft(index: number) {
    setDrafts((current) => {
      const draft = current[index]
      if (draft?.image.startsWith('blob:')) {
        URL.revokeObjectURL(draft.image)
        blobUrls.current.delete(draft.image)
      }
      return current.filter((_, draftIndex) => draftIndex !== index)
    })
  }

  function handleImageChange(index: number, file?: File) {
    if (!file) return
    const nextImage = URL.createObjectURL(file)
    blobUrls.current.add(nextImage)
    const currentImage = drafts[index]?.image
    if (currentImage?.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage)
      blobUrls.current.delete(currentImage)
    }
    updateDraft(index, { file, image: nextImage })
  }

  async function handleSave() {
    const draftsToSave = member ? drafts : drafts.filter((draft) => !isEmptyDraft(draft))
    if (!draftsToSave.length) {
      setError('Add at least one team member.')
      return
    }
    if (draftsToSave.some((draft) => !draft.name.trim())) {
      setError('Enter a name for each team member.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(draftsToSave.map((draft, index) => ({
        name: draft.name.trim(),
        role: draft.role.trim() || 'Veterinary surgeon',
        bio: draft.bio.trim(),
        qualifications: draft.qualifications.map((item) => item.trim()).filter(Boolean).join('\n') || null,
        active: true,
        sortOrder: member?.sortOrder ?? index,
        file: draft.file,
      })))
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
      className="max-w-3xl"
    >
      <div className="grid gap-4">
        {drafts.map((draft, draftIndex) => (
          <div key={draftIndex} className="rounded-xl border border-gray-200 p-4">
            {!member && drafts.length > 1 && (
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#064071]">Team member {draftIndex + 1}</h3>
                <button type="button" onClick={() => removeMemberDraft(draftIndex)} className="inline-flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove team member ${draftIndex + 1}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-black">Image</p>
              <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
                <span className="relative size-16 overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={draft.image}
                    alt="Team member preview"
                    fill
                    sizes="64px"
                    unoptimized={draft.image.startsWith('blob:')}
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
                  onChange={(event) => handleImageChange(draftIndex, event.target.files?.[0])}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TeamInput label="Name" value={draft.name} onChange={(value) => updateDraft(draftIndex, { name: value })} />
              <TeamInput label="Role" value={draft.role} onChange={(value) => updateDraft(draftIndex, { role: value })} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-black">Qualifications</p>
                <button type="button" onClick={() => addQualification(draftIndex)} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-gray-200 px-2 text-xs font-semibold text-[#064071] hover:bg-slate-50">
                  <Plus className="size-3.5" />
                  Add qualification
                </button>
              </div>
              <div className="mt-2 grid gap-2">
                {draft.qualifications.map((qualification, qualificationIndex) => (
                  <div key={qualificationIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={qualification}
                      onChange={(event) => updateQualification(draftIndex, qualificationIndex, event.target.value)}
                      placeholder="e.g. BVSc MRCVS"
                      className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
                    />
                    {draft.qualifications.length > 1 && (
                      <button type="button" onClick={() => removeQualification(draftIndex, qualificationIndex)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" aria-label="Remove qualification">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-sm font-medium text-black">
              Bio
              <textarea
                value={draft.bio}
                onChange={(event) => updateDraft(draftIndex, { bio: event.target.value })}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
              />
            </label>
          </div>
        ))}

        {!member && (
          <button type="button" onClick={addMemberDraft} className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-[#064071] hover:bg-slate-50">
            <Plus className="size-4 text-[#01AEAD]" />
            Add another team member
          </button>
        )}
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
