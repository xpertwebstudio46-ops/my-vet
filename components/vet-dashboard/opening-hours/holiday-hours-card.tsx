import { Plus, Trash2 } from 'lucide-react'
import type { HolidayHour } from './opening-hours-types'

type HolidayHoursCardProps = {
  holidays: HolidayHour[]
  onAdd: () => void
  onDelete: (holiday: HolidayHour) => void
}

export function HolidayHoursCard({
  holidays,
  onAdd,
  onDelete,
}: HolidayHoursCardProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Holiday hours</h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-black hover:bg-slate-50"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>

      <div className="mt-2">
        {holidays.map((holiday) => (
          <div
            key={holiday.id}
            className="flex items-center justify-between gap-4 border-b border-gray-200/80 py-4 last:border-b-0"
          >
            <div>
              <h3 className="text-sm font-semibold text-black">
                {holiday.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {holiday.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(holiday)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-black hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${holiday.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
