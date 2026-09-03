import Image from "next/image";
import { Star, MapPin, ShieldCheck, Phone } from "lucide-react";
import { BookAppointmentButton } from "@/components/appointments/book-appointment-modal";
import { practiceMembershipLabel } from "@/lib/practice-cards";
import type { PracticeMembershipType } from "@/lib/api/types";

export default function VetProfile({ name, bannerUrl, rating, reviewCount, address, phone, practiceId, membershipType }: {
  name: string;
  bannerUrl: string | null;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  practiceId: string;
  membershipType?: PracticeMembershipType | null;
}) {
  return (
    <section className="relative min-h-[560px] w-full overflow-hidden sm:h-[70vh]">
      <Image src={bannerUrl ?? "/images/profile-banner.png"} alt={`${name} profile banner`} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/45" />
     
      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <div className="min-w-0">
          <h1 className="break-words font-heading text-[32px] font-bold leading-tight text-white md:text-[40px]">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white">
            <div className="flex items-center gap-1"><Star size={14} className="fill-[#FFC107] text-[#FFC107]" /><span>{rating.toFixed(1)} ({reviewCount} Reviews)</span></div>
            <div className="flex min-w-0 items-center gap-1"><MapPin size={14} className="shrink-0" /><span className="break-words">{address}</span></div>
            <span className="flex items-center gap-1 rounded-full bg-[#4CAF50] px-2 py-1 text-xs font-medium text-white"><ShieldCheck size={12} />Approved listing</span>
             <span className="absolute left-4 top-24 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#064071] shadow-sm sm:left-6 md:left-12">
        {practiceMembershipLabel(membershipType)}
      </span>
          </div>
        </div>
        <div className="grid gap-3 sm:flex sm:items-center sm:gap-4">
          <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#064071] transition hover:bg-gray-100"><Phone size={16} />Contact</a>
          <BookAppointmentButton practiceId={practiceId} practiceName={name} className="flex items-center justify-center gap-2 rounded-full bg-[#2AB7A9] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#239b8f]" />
        </div>
      </div>
    </section>
  );
}
