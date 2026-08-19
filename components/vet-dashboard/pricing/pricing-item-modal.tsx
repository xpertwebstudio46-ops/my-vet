'use client'

import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { PriceItem } from './pricing-types'

type PricingItemModalProps = {
  sectionTitle: string
  item?: PriceItem
  onClose: () => void
  onSave: (item: PriceItem) => void
}

export function PricingItemModal({
  sectionTitle,
  item,
  onClose,
  onSave,
}: PricingItemModalProps) {
  const [label, setLabel] = useState(item?.label ?? '')
  const [price, setPrice] = useState(item?.price ?? '')

  function handleSave() {
    if (!label.trim()) return

    onSave({
      label: label.trim(),
      price: price.trim() || '\u00a30',
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${item ? 'Edit' : 'Add'} ${sectionTitle.toLowerCase()} price`}
      className="max-w-xl"
    >
      <div className="grid gap-4">
        <PricingInput
          label="Price name"
          value={label}
          onChange={setLabel}
          placeholder="Out-of-hours triage"
        />
        <PricingInput
          label="Price"
          value={price}
          onChange={setPrice}
          placeholder="\u00a395"
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
          {item ? 'Save price' : 'Add price'}
        </button>
      </div>
    </Modal>
  )
}

function PricingInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
