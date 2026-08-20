"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { OpeningHours } from "@/lib/api/types";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ContactInfoCard({ practiceId, address, phone, openingHours }: { practiceId: string; address: string; phone: string; openingHours: OpeningHours[] }) {
  function contact() {
    void apiClient(`/api/practices/${practiceId}/contact-action`, { method: "POST", body: JSON.stringify({ type: "PHONE", source: "practice-profile" }) }, { authenticated: false }).catch(() => undefined);
    window.location.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-[#0d2e5e]">Contact Info</h3>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#13b8a8]" /><p className="text-sm text-slate-600 leading-relaxed">{address}</p></div>
          <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-[#13b8a8]" /><p className="text-sm text-slate-600">{phone}</p></div>
        </div>
        <button type="button" onClick={contact} className="mt-5 w-full rounded-lg bg-[#13b8a8] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">Call Practice</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#13b8a8]" /><h3 className="text-base font-bold text-[#0d2e5e]">Opening Hours</h3></div>
        <div className="mt-4 flex flex-col gap-2.5">
          {openingHours.map((item) => <div key={item.dayOfWeek} className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-500">{days[item.dayOfWeek]}</span><span className={item.isClosed ? "font-medium text-red-500" : "text-slate-900"}>{item.isClosed ? "Closed" : `${item.opensAt} – ${item.closesAt}`}</span></div>)}
          {!openingHours.length && <p className="text-sm text-slate-500">Hours have not been published.</p>}
        </div>
      </div>
    </div>
  );
}
