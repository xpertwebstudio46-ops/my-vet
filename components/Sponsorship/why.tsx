import Link from 'next/link';
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
            Why <span className="text-teal-500">Sponsor</span> My Vet?
          </h2>
          <div className="mx-auto mt-5 max-w-4xl space-y-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            <p>My Vet connects veterinary practices with pet owners across the UK, creating a trusted community focused on animal care and wellbeing. Sponsoring My Vet is an opportunity for brands in pet medication, pharmaceuticals, nutrition, pet clothing, insurance, animal feeds, and related services to showcase their products and services directly to an engaged audience of pet owners and veterinary professionals.</p>
            <p>With sponsorship packages starting from just &pound;30 per month, your business can increase brand visibility, build trust within the veterinary community, and reach pet owners at the point they are actively seeking advice, products, and services for their pets.</p>
          </div>
          <Link href="#sponsorship-enquiry" className="mt-6 inline-flex rounded-full bg-[#064071] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0d2e5e]">Enquire about sponsorship</Link>
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
        <p className="mt-8 text-center text-base font-bold leading-relaxed text-[#064071] sm:text-lg">
          Support the UK&apos;s growing veterinary community while promoting your brand to the people who matter most.
        </p>
      </div>
    </section>
  );
}
