import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { PracticeCardData } from "@/lib/practice-cards";

interface VetCardProps {
  vet: PracticeCardData;
}

const VetCard = ({ vet }: VetCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
      {/* Image */}
      <div className="relative h-60 w-full">
        <Image
          src={vet.image}
          alt={vet.name}
          fill
          className="object-cover"
        />
        <div className="absolute right-2 top-2 bg-white rounded-md  p-1 flex items-center gap-2">
          <Star
            size={14}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="font-bold font-sans text-[14px]">{vet.rating}</span>

        </div>
      </div>

      <div className="p-6">
        <h3 className="text-[20px] font-bold text-black">
          {vet.name}
        </h3>


        {/* Rating */}
        <div className=" flex items-center justify-start gap-4 mt-2">
          <div className=" flex items-center gap-2 text-gray-500">
            <MapPin size={16} className="text-[#01AEAD]" />
            <span className="font-sans text-[14px] font-normal text-[#64748B]">{vet.location}</span>
          </div>
          <span className="font-sans text-[14px] font-normal text-[#64748B]">
            · UK listing
          </span>
        </div>

        {/* Name */}

        {/* Location */}

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {vet.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#163B6D]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-5 text-sm leading-6 text-gray-600">
          {vet.description}
        </p>

        {/* Button */}

        <div className="flex items-center justify-between mt-2">
          <span className="font-sans text-[14px] font-normal text-[#64748B]">
            ({vet.reviewCount} Reviews)
          </span>
          <Link
            href={`/vet-search/${vet.slug}`}
            className="inline-flex rounded-full bg-[#163B6D] px-4 py-2 font-medium text-white transition hover:bg-[#0F2E56]"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VetCard;
