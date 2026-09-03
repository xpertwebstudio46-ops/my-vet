import Link from "next/link";
import Image from "next/image";
import { PawPrint, Star, MapPin } from "lucide-react";
import { practiceMembershipLabel, type PracticeCardData } from "@/lib/practice-cards";

export default function VetCard({ vet }: { vet: PracticeCardData }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full h-[160px]">
        <Image
          src={vet.image}
          alt={vet.name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] flex-col items-start gap-2">
          <span className="max-w-full truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#064071] shadow-sm">
            {practiceMembershipLabel(vet.membershipType)}
          </span>
          {vet.featured && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: "#13b8a8" }}
            >
              Featured
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="Save to favorites"
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90"
        >
          <PawPrint className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-slate-900">{vet.name}</h3>

        <div className="mt-1.5 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="flex min-w-0 items-center gap-1">
            <Star className="h-3.5 w-3.5" fill="#f5a623" stroke="#f5a623" />
            <span className="font-semibold text-slate-900">
              {vet.rating.toFixed(1)}
            </span>
            <span>({vet.reviewCount} reviews)</span>
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "#13b8a8" }} />
            <span className="min-w-0 truncate">{vet.location}</span>
          </span>
        </div>

        <ul className="mt-3 flex flex-col gap-1.5 flex-1">
          {vet.tags.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "#13b8a8" }}
              />
              {tag}
            </li>
          ))}
        </ul>

        <Link
          href={`/vet-search/${vet.slug}`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#163B6D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0F2E56]"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
