import { TriangleAlert } from 'lucide-react'

export function PricingNote() {
  return (
    <div className="flex gap-3 rounded-md border border-[#01AEAD] bg-[#01AEAD]/10 p-4 text-[#047c7b]">
      <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      <p className="text-sm leading-6">
        Keep prices up to date so owners see accurate fees before booking.
        Changes can be saved when your pricing is ready.
      </p>
    </div>
  )
}
