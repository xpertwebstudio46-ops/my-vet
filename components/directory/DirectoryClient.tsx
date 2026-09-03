"use client";

import { useState } from "react";
import FiltersSidebar, { FiltersState } from "@/components/directory/Bar";
import SortTabs, { SortTab } from "@/components/directory/SortTab";
import VetGrid from "@/components/directory/GridVet";
import type { PracticeCardData } from "@/lib/practice-cards";

export default function DirectoryClient({ practices }: { practices: PracticeCardData[] }) {
  const [sortTab, setSortTab] = useState<SortTab>("Featured");
  const [filters, setFilters] = useState<FiltersState>({ minRating: null, membershipTypes: [], facilities: [], openingHours: [] });

  let visible = practices.filter((item) => {
    const matchesRating = !filters.minRating || item.rating >= filters.minRating;
    const matchesMembership = !filters.membershipTypes.length || filters.membershipTypes.includes(item.membershipType);
    return matchesRating && matchesMembership;
  });
  if (sortTab === "Highest Rated") visible = [...visible].sort((a, b) => b.rating - a.rating);
  else if (sortTab === "Newest") visible = [...visible].reverse();
  else visible = [...visible].sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);

  return (
    <div className="w-full bg-slate-50 py-8 px-4 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl min-w-0 gap-6 lg:grid-cols-[260px_1fr] items-start">
        <FiltersSidebar onChange={setFilters} />
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SortTabs onChange={setSortTab} />
            <p className="text-sm text-slate-500">{visible.length} practices</p>
          </div>
          <div className="mt-5">
            {visible.length ? <VetGrid vets={visible} /> : <p className="py-12 text-center text-slate-500">No practices match these filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
