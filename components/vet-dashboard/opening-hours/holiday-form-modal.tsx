'use client'

import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'
import type { HolidayHour } from './opening-hours-types'

type HolidayFormModalProps = {
  onClose: () => void
  onAdd: (holiday: HolidayHour) => void
}

export function HolidayFormModal({ onClose, onAdd }: HolidayFormModalProps) {
  const [name, setName] = useState('')
  const [detail, setDetail] = useState('')

  function handleAdd() {
    if (!name.trim()) return

    onAdd({
      id: `holiday-${Date.now()}`,
      name: name.trim(),
      detail: detail.trim() || '03 Apr 2026 · Closed',
    })
  }

  return (
    <Modal open onClose={onClose} title="Add holiday hours" className="max-w-xl">
      <div className="grid gap-4">
        <HolidayInput
          label="Holiday name"
          value={name}
          onChange={setName}
          placeholder="Good Friday"
        />
        <HolidayInput
          label="Date and status"
          value={detail}
          onChange={setDetail}
          placeholder="03 Apr 2026 · Closed"
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
          onClick={handleAdd}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
        >
          Add holiday
        </button>
      </div>
    </Modal>
  )
}

function HolidayInput({
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
