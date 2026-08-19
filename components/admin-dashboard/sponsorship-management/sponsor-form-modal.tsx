'use client'

import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { Sponsor } from './sponsor-types'

type SponsorFormModalProps = {
  sponsor?: Sponsor | null
  onClose: () => void
  onSave: (sponsor: Sponsor) => void
}

export function SponsorFormModal({
  sponsor,
  onClose,
  onSave,
}: SponsorFormModalProps) {
  const [image, setImage] = useState(sponsor?.image ?? '/images/practice-1.png')
  const [name, setName] = useState(sponsor?.name ?? '')
  const [planTag, setPlanTag] = useState(sponsor?.planTag ?? '')
  const [spend, setSpend] = useState(sponsor?.spend ?? '')
  const [contractNo, setContractNo] = useState(sponsor?.contractNo ?? '')

  function handleImageChange(file?: File) {
    if (!file) return
    setImage(URL.createObjectURL(file))
  }

  function handleSave() {
    if (!name.trim()) return

    onSave({
      id: sponsor?.id ?? `sponsor-${Date.now()}`,
      image,
      name: name.trim(),
      planTag: planTag.trim() || 'Gold sponsor',
      spend: spend.trim() || '£0',
      contractNo: contractNo.trim() || 'Pending',
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={sponsor ? 'Edit sponsor' : 'Add sponsor'}
      className="max-w-xl"
    >
      <div className="grid gap-4">
        <div>
          <p className="text-sm font-medium text-black">Image</p>
          <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-3 hover:border-[#01AEAD] hover:bg-[#EEF7F5]">
            <span className="relative size-16 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={image}
                alt="Sponsor preview"
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

        <SponsorInput label="Sponsor name" value={name} onChange={setName} />
        <SponsorInput label="Plan tag" value={planTag} onChange={setPlanTag} />
        <SponsorInput label="Spend amount" value={spend} onChange={setSpend} />
        <SponsorInput
          label="Contract no."
          value={contractNo}
          onChange={setContractNo}
        />
      </div>

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
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          Save sponsor
        </button>
      </div>
    </Modal>
  )
}

function SponsorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
