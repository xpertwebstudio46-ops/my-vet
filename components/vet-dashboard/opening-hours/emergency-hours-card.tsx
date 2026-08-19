import { OpeningHoursToggle } from './opening-hours-toggle'
import type { EmergencyOption } from './opening-hours-types'

type EmergencyHoursCardProps = {
  options: EmergencyOption[]
  onToggle: (id: string) => void
}

export function EmergencyHoursCard({
  options,
  onToggle,
}: EmergencyHoursCardProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Emergency hours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Emergency options
        </p>
      </div>

      <div className="mt-2">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between gap-4 border-b border-gray-200/80 py-4 last:border-b-0"
          >
            <p className="text-sm text-muted-foreground">{option.label}</p>
            <OpeningHoursToggle
              active={option.enabled}
              onClick={() => onToggle(option.id)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
