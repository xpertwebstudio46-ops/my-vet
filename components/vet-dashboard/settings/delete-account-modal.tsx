'use client'

import { useState } from 'react'
import { Modal } from '@/components/dashboard/modal'

export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [deleteText, setDeleteText] = useState('')

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete vet account?"
      description="Type DELETE to confirm this action."
    >
      <div className="grid gap-4">
        <input
          value={deleteText}
          onChange={(event) => setDeleteText(event.target.value)}
          placeholder="Type DELETE"
          className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteText !== 'DELETE'}
            className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </Modal>
  )
}
