import { Eye, TrendingUp, ShieldCheck, Map } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Increased Visibility",
    description:
      "Get your brand in front of thousands of pet owners actively seeking veterinary care.",
  },
  {
    icon: TrendingUp,
    title: "Brand Exposure",
    description:
      "Premium placement across high-traffic pages and targeted search results.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Audience",
    description:
      "Connect with a highly engaged community that values quality animal care.",
  },
  {
    icon: Map,
    title: "Nationwide Reach",
    description:
      "Target specific regions or run nationwide campaigns across the UK.",
  },
];

export default function WhySponsorUs() {
  return (
    <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold font-heading leading-tight text-[#064071] sm:text-[40px]">
            Why <span className="text-teal-500">Sponsor</span> Us?
          </h2>
          <p className="mt-3 font-sans text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
            Align your brand with the UK&apos;s most trusted veterinary
            directory and connect directly with your target audience.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="font-sans text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
