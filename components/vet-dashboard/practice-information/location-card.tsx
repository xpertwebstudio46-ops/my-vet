import { MapPin } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { InfoField } from './form-field'

export function LocationCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Location
      </h2>

      <div className="mt-5">
        <InfoField
          label="Full address"
          defaultValue="42 Walton Street, Oxford, OX2 6AD"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
        <iframe
          title="Practice location map"
          src="https://www.google.com/maps?q=Oxford%20OX2%206AD&output=embed"
          className="h-72 w-full border-0"
          loading="lazy"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-[#01AEAD]" />
          Pin set from your postcode — drag to fine-tune.
        </p>
        <button
          type="button"
          className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          Adjust pin
        </button>
      </div>
    </Card>
  )
}
