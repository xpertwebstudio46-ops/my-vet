'use client'

import { useState } from "react";
import { CheckCircle2, Stethoscope } from "lucide-react";

type Service = { id: string; name: string; description: string | null; price: string | null; currency: string };
type Facility = { id: string; name: string; description: string | null };

export default function AboutPracticeSection({ name, description, mission, whatWeDo, careOptions, services, facilities, animalTypes }: {
  name: string;
  description: string;
  mission?: string;
  whatWeDo?: string | null;
  careOptions: string[];
  services: Service[];
  facilities: Facility[];
  animalTypes: string[];
}) {
  const tabs = [
    { key: "about", label: "About" },
    ...(whatWeDo ? [{ key: "what-we-do", label: "What we do" }] : []),
    ...(careOptions.length ? [{ key: "care-offered", label: "Care offered" }] : []),
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "about");

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#0d2e5e] sm:text-2xl">About {name}</h2>

        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-100">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${activeTab === tab.key ? "border-[#13b8a8] text-[#0d2e5e]" : "border-transparent text-slate-500 hover:text-[#0d2e5e]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-28">
          {activeTab === "about" && (
            <div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-500">{description}</p>
              {mission && <div className="mt-5 rounded-xl border-l-4 border-[#13b8a8] bg-[#eafaf8] p-4"><p className="text-xs font-semibold text-[#0f9c8e]">Our Mission</p><p className="mt-1 text-sm italic leading-relaxed text-slate-600">&quot;{mission}&quot;</p></div>}
              {!!animalTypes.length && <p className="mt-5 text-xs text-slate-500"><span className="font-semibold text-slate-700">Animals cared for:</span> {animalTypes.join(", ")}</p>}
            </div>
          )}

          {activeTab === "what-we-do" && whatWeDo && (
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">What we do</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{whatWeDo}</p>
            </div>
          )}

          {activeTab === "care-offered" && !!careOptions.length && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Care offered</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {careOptions.map((option) => <span key={option} className="inline-flex items-center gap-2 rounded-lg border border-[#13b8a8]/20 bg-[#eafaf8] px-3 py-2 text-sm font-medium text-[#0f766e]"><CheckCircle2 className="size-4 shrink-0" />{option}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-[#0d2e5e] sm:text-2xl">Services</h2>
        {services.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{services.map((service) => (
          <div key={service.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eafaf8]"><Stethoscope className="h-4 w-4 text-[#13b8a8]" /></span>
            <div><p className="text-sm font-semibold text-slate-900">{service.name}</p><p className="mt-0.5 text-xs text-slate-500">{service.description ?? (service.price ? `From ${service.currency} ${service.price}` : "Contact the practice for details")}</p></div>
          </div>
        ))}</div> : <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">This practice has not published its service list yet.</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-[#0d2e5e] sm:text-2xl">Facilities</h2>
        {facilities.length ? <div className="flex flex-wrap gap-3">{facilities.map((facility) => <span key={facility.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-[#13b8a8]" />{facility.name}</span>)}</div> : <p className="text-sm text-slate-500">No facilities have been published yet.</p>}
      </div>
    </div>
  );
}
