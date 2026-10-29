"use client";

import { useState } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { emergencyDayOrder, emergencyDayNames, emergencyTimeLabel } from "@/lib/emergency-hours";
import type { Practice, OpeningHours } from "@/lib/api/types";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ContactInfoCard({ practiceId, address, phone, openingHours, emergencyHours }: { practiceId: string; address: string; phone: string; openingHours: OpeningHours[]; emergencyHours?: Practice["emergencyHours"] }) {
  const [hoursTab, setHoursTab] = useState("opening");
  const showEmergency = !!emergencyHours?.enabled;
  function contact() {
    void apiClient(`/api/practices/${practiceId}/contact-action`, { method: "POST", body: JSON.stringify({ type: "PHONE", source: "practice-profile" }) }, { authenticated: false }).catch(() => undefined);
    window.location.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
  }

  return (
    <div className="min-w-0 [overflow-wrap:anywhere] flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="text-base font-bold text-[#0d2e5e]">Contact Info</h3>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#13b8a8]" /><p className="min-w-0 text-sm text-slate-600 leading-relaxed">{address}</p></div>
          <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-[#13b8a8]" /><p className="min-w-0 text-sm text-slate-600">{phone}</p></div>
        </div>
        <button type="button" onClick={contact} className="mt-5 w-full rounded-lg bg-[#13b8a8] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">Call Practice</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3" aria-label="Practice hours">
          <Clock className="h-4 w-4 shrink-0 text-[#13b8a8]" aria-hidden="true" />
          <button type="button" onClick={() => setHoursTab('opening')} aria-pressed={hoursTab === 'opening' || !showEmergency} className={hoursTab === 'opening' || !showEmergency ? 'rounded-lg bg-teal-50 px-2 py-2 text-sm font-bold text-[#0d2e5e]' : 'rounded-lg px-2 py-2 text-sm font-semibold text-slate-500'}>Opening Hours</button>
          {showEmergency && <button type="button" onClick={() => setHoursTab('emergency')} aria-pressed={hoursTab === 'emergency'} className={hoursTab === 'emergency' ? 'rounded-lg bg-red-50 px-2 py-2 text-sm font-bold text-red-700' : 'rounded-lg px-2 py-2 text-sm font-semibold text-slate-500'}>Emergency Hours</button>}
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {hoursTab === 'emergency' && showEmergency ? <>
            {emergencyHours?.weeklyHours?.length ? emergencyDayOrder.map((dayOfWeek) => {
              const day = emergencyHours.weeklyHours!.find((item) => item.dayOfWeek === dayOfWeek);
              return day && <div key={dayOfWeek} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-sm"><span className="text-slate-500">{emergencyDayNames[dayOfWeek]}</span><span className={day.isClosed ? 'text-slate-400' : 'font-medium text-[#0d2e5e]'}>{emergencyTimeLabel(day)}</span></div>;
            }) : <p className="text-sm text-slate-500">Contact the practice to confirm emergency availability.</p>}
            {(emergencyHours?.outOfHoursPhone || emergencyHours?.phone) && <a href={'tel:' + (emergencyHours.outOfHoursPhone || emergencyHours.phone)!.replace(/[^+\d]/g, '')} className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">Call emergency contact</a>}
          </> : <>
            {[...openingHours].sort((a, b) => emergencyDayOrder.indexOf(a.dayOfWeek) - emergencyDayOrder.indexOf(b.dayOfWeek)).map((item) => <div key={item.dayOfWeek} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm"><span className="text-slate-500">{days[item.dayOfWeek]}</span><span className={item.isClosed ? "font-medium text-red-500" : "text-slate-900"}>{item.isClosed ? "Closed" : item.opensAt + ' ? ' + item.closesAt}</span></div>)}
            {!openingHours.length && <p className="text-sm text-slate-500">Hours have not been published.</p>}
          </>}
        </div>
      </div>
    </div>
  );
}
