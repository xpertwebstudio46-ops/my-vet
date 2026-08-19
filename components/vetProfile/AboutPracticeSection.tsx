import { Syringe, Stethoscope, Scissors, Siren, HeartPulse, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: Syringe,
    title: "Vaccination & Preventative",
    description: "Annual boosters, flea & worm treatments",
  },
  {
    icon: Stethoscope,
    title: "Dentistry",
    description: "Scale & polish, extractions, dental x-rays",
  },
  {
    icon: Scissors,
    title: "Surgery",
    description: "Routine desexing to complex soft tissue",
  },
  {
    icon: Siren,
    title: "Emergency Care",
    description: "24/7 out of hours emergency service",
  },
  {
    icon: HeartPulse,
    title: "Farm Visits",
    description: "Herd health and emergency callouts",
  },
  {
    icon: ShieldCheck,
    title: "Equine Care",
    description: "Routine health checks and lameness exams",
  },
];

const facilities = [
  "Modern Hospital",
  "Digital Imaging",
  "In-House Lab",
  "Wheelchair Access",
  "Operating Theatre",
];

export default function AboutPracticeSection({
  name = "Greenfield Veterinary Surgery",
  description = "Greenfield Veterinary Surgery has been providing exceptional care to the pets of Manchester for over 30 years. Our state-of-the-art facility is equipped with the latest technology to ensure your furry family members receive the best possible treatment. We believe in a compassionate, hands-on approach to veterinary medicine.",
  mission = "To provide compassionate, comprehensive and advanced veterinary care while maintaining a warm, welcoming environment for both pets and their owners.",
}: {
  name?: string;
  description?: string;
  mission?: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* About */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e]">
          About {name}
        </h2>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          {description}
        </p>

        <div
          className="mt-5 rounded-xl border-l-4 p-4"
          style={{ borderColor: "#13b8a8", backgroundColor: "#eafaf8" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#0f9c8e" }}>
            Our Mission
          </p>
          <p className="mt-1 text-sm text-slate-600 italic leading-relaxed">
            &ldquo;{mission}&rdquo;
          </p>
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e] mb-4">
          Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "#eafaf8" }}
              >
                <Icon className="h-4 w-4" style={{ color: "#13b8a8" }} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e] mb-4">
          Facilities
        </h2>
        <div className="flex flex-wrap gap-3">
          {facilities.map((facility) => (
            <span
              key={facility}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#13b8a8" }}
              />
              {facility}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
