'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import { ApiClientError } from '@/lib/api/client'
import type { Sponsor, SponsorInput } from './sponsor-types'

export function SponsorFormModal({ sponsor, onClose, onSave }: { sponsor?: Sponsor | null; onClose: () => void; onSave: (sponsor: SponsorInput) => Promise<void> }) {
  const [file, setFile] = useState<File>()
  const [image, setImage] = useState(sponsor?.imageUrl ?? '/placeholder.svg')
  const [name, setName] = useState(sponsor?.name ?? '')
  const [description, setDescription] = useState(sponsor?.description ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(sponsor?.websiteUrl ?? '')
  const [startsAt, setStartsAt] = useState((sponsor?.startsAt ?? new Date().toISOString()).slice(0, 10))
  const [endsAt, setEndsAt] = useState(() => {
    if (sponsor?.endsAt) return sponsor.endsAt.slice(0, 10)
    const end = new Date(); end.setFullYear(end.getFullYear() + 1); return end.toISOString().slice(0, 10)
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { if (image.startsWith('blob:')) URL.revokeObjectURL(image) }, [image])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true); setError('')
    try {
      await onSave({ name: name.trim(), description: description.trim() || null, websiteUrl: websiteUrl.trim() || null, startsAt, endsAt, active: sponsor?.active ?? true, sortOrder: sponsor?.sortOrder ?? 0, file })
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Sponsor could not be saved.'); setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={sponsor ? 'Edit sponsor' : 'Add sponsor'} className="max-w-xl">
      <div className="grid gap-4">
        <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
          <span className="relative size-16 overflow-hidden rounded-md bg-slate-100"><Image src={image} alt="Sponsor preview" fill sizes="64px" unoptimized={image.startsWith('blob:')} className="object-cover" /></span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#064071]"><ImagePlus className="size-4 text-[#01AEAD]" />Upload image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) { setFile(selected); setImage(URL.createObjectURL(selected)) } }} />
        </label>
        <SponsorInput label="Sponsor name" value={name} onChange={setName} />
        <SponsorInput label="Website URL" type="url" value={websiteUrl} onChange={setWebsiteUrl} />
        <div className="grid gap-4 sm:grid-cols-2"><SponsorInput label="Start date" type="date" value={startsAt} onChange={setStartsAt} /><SponsorInput label="End date" type="date" value={endsAt} onChange={setEndsAt} /></div>
        <label className="block text-sm font-medium text-black">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD]" /></label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071]">Cancel</button><button type="button" onClick={() => void handleSave()} disabled={saving} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save sponsor'}</button></div>
    </Modal>
  )
}

function SponsorInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-sm font-medium text-black">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD]" /></label>
}
