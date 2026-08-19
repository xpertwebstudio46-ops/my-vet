"use client";

import { useState } from "react";
import FiltersSidebar, { FiltersState } from "@/components/directory/Bar";
import SortTabs, { SortTab } from "@/components/directory/SortTab";
import VetGrid from "@/components/directory/GridVet";
import { vet } from "@/data/directory";
import type { Vet } from "@/data/directory";
import HeroDirectory from "@/components/directory/HeroDirectory";
import Footer from "@/components/Footer";

export default function DirectoryPage() {
  const [sortTab, setSortTab] = useState<SortTab>("Featured");
  const [filters, setFilters] = useState<FiltersState>({
    minRating: null,
    facilities: [],
    openingHours: [],
  });

  // Apply filters
  let visibleVets: Vet[] = vet.filter((item: Vet) => {
    if (filters.minRating && item.rating < filters.minRating) return false;
    return true;
  });

  // Apply sort
  if (sortTab === "Highest Rated") {
    visibleVets = [...visibleVets].sort(
      (a: Vet, b: Vet) => b.rating - a.rating
    );
  } else if (sortTab === "Newest") {
    visibleVets = [...visibleVets].sort((a: Vet, b: Vet) => b.id - a.id);
  } else {
    // Featured — featured items first
    visibleVets = [...visibleVets].sort(
      (a: Vet, b: Vet) => Number(b.featured) - Number(a.featured)
    );
  }

  return (
    <div>
    <HeroDirectory/>
    <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <FiltersSidebar onChange={setFilters} />

        {/* Main content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SortTabs onChange={setSortTab} />

          <div className="mt-5">
            <VetGrid vets={visibleVets} />
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
}
