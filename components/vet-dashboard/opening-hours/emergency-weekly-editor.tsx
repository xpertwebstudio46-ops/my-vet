import { type EmergencyDay, emergencyDayNames, emergencyDayOrder } from '@/lib/emergency-hours'

export function EmergencyWeeklyEditor({ value, onChange }: { value: EmergencyDay[]; onChange: (days: EmergencyDay[]) => void }) {
  function update(dayOfWeek: number, changes: Partial<EmergencyDay>) {
    onChange(value.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day))
  }
  return (
    <fieldset className="min-w-0 border-t border-slate-200 pt-5">
      <legend className="mb-2 px-1 text-sm font-bold text-[#064071]">Weekly emergency hours</legend>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">Select available days and times, or choose 24-hour cover. An end time earlier than the start time means the following day.</p>
      <div className="space-y-3">
        {emergencyDayOrder.map((dayOfWeek) => {
          const day = value.find((item) => item.dayOfWeek === dayOfWeek)!
          return <div key={dayOfWeek} className={`rounded-xl border p-3 ${day.isClosed ? 'border-slate-200 bg-slate-50' : 'border-teal-200 bg-teal-50/40'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={!day.isClosed} onChange={(event) => update(dayOfWeek, { isClosed: !event.target.checked, ...(!event.target.checked ? { is24Hours: false } : { opensAt: day.opensAt ?? '18:00', closesAt: day.closesAt ?? '09:00' }) })} className="h-4 w-4 accent-teal-600" />{emergencyDayNames[dayOfWeek]}</label>
              <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" disabled={day.isClosed} checked={day.is24Hours} onChange={(event) => update(dayOfWeek, { is24Hours: event.target.checked })} className="h-4 w-4 accent-teal-600" />24 hours</label>
            </div>
            {!day.isClosed && !day.is24Hours && <div className="mt-3 grid grid-cols-2 gap-3">{(['opensAt', 'closesAt'] as const).map((key) => <label key={key} className="min-w-0 text-xs text-slate-500">{key === 'opensAt' ? 'From' : 'Until'}<input type="time" aria-label={`${emergencyDayNames[dayOfWeek]} emergency ${key === 'opensAt' ? 'start' : 'end'}`} value={day[key] ?? ''} onChange={(event) => update(dayOfWeek, { [key]: event.target.value || null })} className="mt-1 h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800" /></label>)}</div>}
          </div>
        })}
      </div>
    </fieldset>
  )
}
