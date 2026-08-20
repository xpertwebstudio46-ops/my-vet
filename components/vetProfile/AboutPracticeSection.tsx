import { Stethoscope } from "lucide-react";

type Service = { id: string; name: string; description: string | null; price: string | null; currency: string };
type Facility = { id: string; name: string; description: string | null };

export default function AboutPracticeSection({ name, description, mission, services, facilities, animalTypes }: {
  name: string;
  description: string;
  mission?: string;
  services: Service[];
  facilities: Facility[];
  animalTypes: string[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e]">About {name}</h2>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-500 leading-relaxed">{description}</p>
        {mission && <div className="mt-5 rounded-xl border-l-4 border-[#13b8a8] bg-[#eafaf8] p-4"><p className="text-xs font-semibold text-[#0f9c8e]">Our Mission</p><p className="mt-1 text-sm text-slate-600 italic leading-relaxed">“{mission}”</p></div>}
        {!!animalTypes.length && <p className="mt-5 text-xs text-slate-500"><span className="font-semibold text-slate-700">Animals cared for:</span> {animalTypes.join(", ")}</p>}
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e] mb-4">Services</h2>
        {services.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{services.map((service) => (
          <div key={service.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eafaf8]"><Stethoscope className="h-4 w-4 text-[#13b8a8]" /></span>
            <div><p className="text-sm font-semibold text-slate-900">{service.name}</p><p className="text-xs text-slate-500 mt-0.5">{service.description ?? (service.price ? `From ${service.currency} ${service.price}` : "Contact the practice for details")}</p></div>
          </div>
        ))}</div> : <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">This practice has not published its service list yet.</p>}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e] mb-4">Facilities</h2>
        {facilities.length ? <div className="flex flex-wrap gap-3">{facilities.map((facility) => <span key={facility.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-[#13b8a8]" />{facility.name}</span>)}</div> : <p className="text-sm text-slate-500">No facilities have been published yet.</p>}
      </div>
    </div>
  );
}
