'use client'

import { useState } from 'react'
import { Check, ExternalLink, MapPin } from 'lucide-react'
import { type CalloutArea, calloutDays, calloutDayNames, calloutPrice } from '@/lib/callout-areas'

export default function CalloutAreas({ areas }: { areas: CalloutArea[] }) {
  const [selectedId, setSelectedId] = useState(areas[0]?.id)
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0]
  if (!selected) return null
  const mapQuery = [selected.location, selected.postcodes[0], 'United Kingdom'].filter(Boolean).join(', ')
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="callout-areas-title">
      <div className="flex items-start gap-3">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
        <div>
          <h3 id="callout-areas-title" className="text-lg font-bold text-[#0d2e5e]">Free or Reduced Call-out Areas</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Free or reduced-cost call-outs to these areas on selected days. Select an area to view its location.</p>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <iframe
          key={selected.id}
          title={`Call-out area map: ${selected.location}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[280px] w-full border-0 sm:h-[380px]"
          allowFullScreen
        />
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 text-xs">
          <span className="font-semibold text-[#0d2e5e]">Showing: {selected.location}</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-teal-700">Open map <ExternalLink size={13} /></a>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => (
          <article key={area.id} className={`flex min-w-0 flex-col rounded-xl border p-4 ${selected.id === area.id ? 'border-teal-400 bg-teal-50/30 ring-1 ring-teal-100' : 'border-slate-200 bg-white'}`}>
            <h4 className="break-words text-sm font-bold text-slate-900">{area.location}</h4>
            {area.description && <p className="mt-2 whitespace-pre-line break-words text-xs leading-relaxed text-slate-500">{area.description}</p>}
            <p className="mb-2 mt-4 text-xs font-medium text-slate-600">Available days</p>
            <ul className="grid grid-cols-7 gap-1" aria-label={`Availability for ${area.location}`}>
              {calloutDays.map((day, index) => (
                <li key={day} className="min-w-0 text-center" aria-label={`${calloutDayNames[index]}: ${area.days.includes(index) ? 'available' : 'unavailable'}`}>
                  <span className="mb-1 block text-[10px] text-slate-500">{day}</span>
                  <span className={`flex h-6 items-center justify-center rounded-md ${area.days.includes(index) ? 'bg-[#0d2e5e] text-white' : 'border border-slate-200 bg-slate-100'}`}>
                    {area.days.includes(index) && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 rounded-lg bg-slate-100 p-3 text-xs">
              <div className="flex flex-wrap justify-between gap-1"><dt className="text-slate-500">Standard cost</dt><dd className="font-semibold text-slate-800">{calloutPrice(area.standardMin, area.standardMax)}</dd></div>
              <div className="flex flex-wrap justify-between gap-1"><dt className="text-slate-500">Free / reduced cost</dt><dd className="font-bold text-teal-700">{calloutPrice(area.reducedMin, area.reducedMax)}</dd></div>
            </dl>
            {!!area.postcodes.length && <div className="mt-4"><p className="mb-2 text-xs text-slate-500">Postcodes</p><div className="flex flex-wrap gap-1.5">{area.postcodes.map((postcode) => <span key={postcode} className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-700">{postcode}</span>)}</div></div>}
            <button type="button" onClick={() => setSelectedId(area.id)} aria-pressed={selected.id === area.id} className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-teal-700"><MapPin size={14} />{selected.id === area.id ? 'Shown on map' : 'View on map'}</button>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">Prices and availability are supplied by the practice. Contact the practice to confirm your address is covered and arrange a visit. Map pins show area locations, not exact coverage boundaries.</p>
    </section>
  )
}
