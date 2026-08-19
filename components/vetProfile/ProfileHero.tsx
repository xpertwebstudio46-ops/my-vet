import Image from "next/image";
import { Star, MapPin, ShieldCheck, Phone, Calendar } from "lucide-react";

const VetProfile = ({ name }: { name: string }) => {
  return (
    <section className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/profile-banner.png"
        alt={`${name} profile banner`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex items-end justify-between px-6 md:px-12">
        {/* Left Side */}
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            {name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white">
            <div className="flex items-center gap-1">
              <Star
                size={14}
                className="fill-[#FFC107] text-[#FFC107]"
              />
              <span>4.8 (124 Reviews)</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>123 Greenfield Road, Manchester, M1 4AB</span>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-[#4CAF50] px-2 py-1 text-xs font-medium text-white">
              <ShieldCheck size={12} />
              Verified
            </span>
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#064071] transition hover:bg-gray-100">
            <Phone size={16} />
            Contact
          </button>

          <button className="flex items-center gap-2 rounded-full bg-[#2AB7A9] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#239b8f]">
            <Calendar size={16} />
            Book Appt
          </button>
        </div>
      </div>
    </section>
  );
};

export default VetProfile;