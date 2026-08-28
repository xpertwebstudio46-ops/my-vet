"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import type { Paginated, Practice } from "@/lib/api/types";
import { toPracticeCard, type PracticeCardData } from "@/lib/practice-cards";

export default function TopRatedPractices() {
  const [practices, setPractices] = useState<PracticeCardData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void apiClient<Paginated<Practice>>("/api/practices?page=1&limit=3&sort=rating", {}, { authenticated: false })
      .then((result) => setPractices(result.items.map(toPracticeCard)))
      .catch(() => setPractices([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="bg-gray-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="font-heading font-extrabold text-[32px] leading-tight text-[#064071] mb-3 sm:text-[40px]">Top Rated <span className="text-[#01AEAD]">Veterinary</span> Practices</h2>
        <p className="text-black text-[16px] font-sans font-normal leading-relaxed max-w-xl mx-auto">Discover highly recommended professionals in your area, reviewed by our community of pet owners.</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {practices.map((practice) => (
          <div key={practice.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
            <div className="relative w-full h-[220px]"><Image src={practice.image} alt={practice.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-heading font-bold text-[20px] text-black mb-1">{practice.name}</h3>
              <div className="flex items-center gap-1 mb-3"><img src="/images/location.png" alt="" className="w-3.5 h-3.5 object-contain shrink-0" aria-hidden="true" /><span className="text-[12px] text-black">{practice.location}</span></div>
              <div className="flex flex-wrap gap-1.5 mb-3">{practice.tags.map((tag) => <span key={tag} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#01AEAD]/10 text-[#01AEAD]">{tag}</span>)}</div>
              <p className="text-black font-sans text-[16px] leading-relaxed mb-5 flex-1">{practice.description}</p>
              <Link href={`/vet-search/${practice.slug}`} className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full text-[14.64px] font-normal text-white bg-[#064071]">View Profile<img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" /></Link>
            </div>
          </div>
        ))}
      </div>
      {loaded && !practices.length && <p className="text-center text-sm text-slate-500">Practice listings will appear after the database import is run.</p>}
    </section>
  );
}
