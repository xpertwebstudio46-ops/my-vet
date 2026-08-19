'use client'

import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { VetService } from './service-types'

type ServiceFormModalProps = {
  onClose: () => void
  onAdd: (service: VetService) => void
}

export function ServiceFormModal({ onClose, onAdd }: ServiceFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  function handleSave() {
    if (!name.trim()) return

    onAdd({
      id: `service-${Date.now()}`,
      name: name.trim(),
      description:
        description.trim() || 'Service details shown on your public listing.',
      price: price.trim() || '£23',
      active: true,
    })
  }

  return (
    <Modal open onClose={onClose} title="Add new service" className="max-w-xl">
      <div className="grid gap-4">
        <ServiceInput label="Service name" value={name} onChange={setName} />
        <ServiceInput label="Price" value={price} onChange={setPrice} />
        <label className="block text-sm font-medium text-black">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>
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
          Add service
        </button>
      </div>
    </Modal>
  )
}

function ServiceInput({
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
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
