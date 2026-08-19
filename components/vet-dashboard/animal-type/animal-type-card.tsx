import Image from 'next/image'
import { Check } from 'lucide-react'
import type { AnimalTypeOption } from './animal-type-types'

export function AnimalTypeCard({
  animal,
  onToggle,
}: {
  animal: AnimalTypeOption
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex min-h-28 w-full items-start justify-between gap-4 rounded-md border p-4 text-left shadow-lg shadow-black/5 transition-colors ${
        animal.selected
          ? 'border-[#01AEAD] bg-[#01AEAD]/10'
          : 'border-gray-200 bg-white hover:border-[#01AEAD]/50 hover:bg-[#01AEAD]/5'
      }`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
          <Image
            src={animal.image}
            alt={animal.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </span>

        <span className="min-w-0">
          <span className="block text-base font-semibold text-black">
            {animal.name}
          </span>
          <span
            className={`mt-2 block text-sm ${
              animal.selected ? 'text-[#047c7b]' : 'text-muted-foreground'
            }`}
          >
            {animal.selected ? 'Shown on your list' : 'Not treated here'}
          </span>
        </span>
      </span>

      <span
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border ${
          animal.selected
            ? 'border-[#01AEAD] bg-[#01AEAD] text-white'
            : 'border-gray-200 bg-white text-transparent'
        }`}
      >
        <Check className="size-4" />
      </span>
    </button>
  )
}
