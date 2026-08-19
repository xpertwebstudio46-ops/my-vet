import { OpeningHoursToggle } from './opening-hours-toggle'
import type { WeeklyHour } from './opening-hours-types'

type WeeklyHoursCardProps = {
  hours: WeeklyHour[]
  onToggle: (day: string) => void
  onTimeChange: (day: string, field: 'start' | 'end', value: string) => void
}

export function WeeklyHoursCard({
  hours,
  onToggle,
  onTimeChange,
}: WeeklyHoursCardProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Weekly hours</h2>
      </div>

      <div className="mt-2">
        {hours.map((item) => (
          <div
            key={item.day}
            className="flex flex-col gap-3 border-b border-gray-200/80 py-4 last:border-b-0 md:flex-row md:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 md:justify-start">
              <p className="w-28 text-sm font-semibold text-black">
                {item.day}
              </p>
              {item.day === 'Sunday' ? (
                <span className="rounded-full bg-[#064071] px-3 py-1 text-xs font-semibold text-white">
                  Closed
                </span>
              ) : (
                <OpeningHoursToggle
                  active={item.open}
                  onClick={() => onToggle(item.day)}
                />
              )}
            </div>

            {item.day !== 'Sunday' && (
              <div className="grid gap-3 sm:grid-cols-2 md:w-72">
                <TimeInput
                  label={`${item.day} start time`}
                  value={item.start}
                  onChange={(value) => onTimeChange(item.day, 'start', value)}
                />
                <TimeInput
                  label={`${item.day} end time`}
                  value={item.end}
                  onChange={(value) => onTimeChange(item.day, 'end', value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="h-10 rounded-md border border-gray-200 px-3 text-sm font-semibold text-black outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
    />
  )
}
