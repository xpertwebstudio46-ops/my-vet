import {
  Accessibility,
  Car,
  Check,
  FlaskConical,
  HeartPulse,
  Hospital,
  Pill,
  ScanLine,
  Scissors,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import type { FacilityOption } from './facility-types'

const facilityIcons: Record<string, LucideIcon> = {
  parking: Car,
  'wheelchair-access': Accessibility,
  'emergency-room': HeartPulse,
  'onsite-lab': FlaskConical,
  'digital-xray': ScanLine,
  'surgery-suite': Hospital,
  pharmacy: Pill,
  'isolation-ward': ShieldAlert,
  ultrasound: ScanLine,
  'grooming-room': Scissors,
}

export function FacilityCard({
  facility,
  onToggle,
}: {
  facility: FacilityOption
  onToggle: () => void
}) {
  const Icon = facilityIcons[facility.id] ?? Hospital

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex min-h-28 w-full items-start justify-between gap-4 rounded-md border p-4 text-left shadow-lg shadow-black/5 transition-colors ${
        facility.selected
          ? 'border-[#01AEAD] bg-[#01AEAD]/10'
          : 'border-gray-200 bg-white hover:border-[#01AEAD]/50 hover:bg-[#01AEAD]/5'
      }`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-[#01AEAD] shadow-md shadow-black/10">
          <Icon className="size-5" />
        </span>

        <span className="min-w-0">
          <span className="block text-base font-semibold text-black">
            {facility.name}
          </span>
          <span
            className={`mt-2 block text-sm ${
              facility.selected ? 'text-[#047c7b]' : 'text-muted-foreground'
            }`}
          >
            {facility.selected ? 'Shown on your list' : 'Not available here'}
          </span>
        </span>
      </span>

      <span
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border ${
          facility.selected
            ? 'border-[#01AEAD] bg-[#01AEAD] text-white'
            : 'border-gray-200 bg-white text-transparent'
        }`}
      >
        <Check className="size-4" />
      </span>
    </button>
  )
}
