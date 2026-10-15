"use client";

import { useEffect, useState } from "react";
import FiltersSidebar, { type AnimalTypeOption, type FiltersState } from "@/components/directory/Bar";
import SortTabs, { type SortTab } from "@/components/directory/SortTab";
import VetGrid from "@/components/directory/GridVet";
import DirectorySkeleton from "@/components/directory/DirectorySkeleton";
import DirectoryPagination from "@/components/directory/DirectoryPagination";
import { toPracticeCard } from "@/lib/practice-cards";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Paginated, Practice } from "@/lib/api/types";

const PAGE_SIZE = 10;
const ANIMAL_TYPES_REFRESH_MS = 30_000;
const emptyFilters: FiltersState = { minRating: null, membershipTypes: [], facilities: [], openingHours: [], animalTypes: [] };
type DirectoryQuery = { page: number; sort: SortTab; filters: FiltersState };

export default function DirectoryClient({ initialResult, initialAnimalTypes }: { initialResult: Paginated<Practice>; initialAnimalTypes: AnimalTypeOption[] }) {
  const [result, setResult] = useState(initialResult);
  const [animalTypes, setAnimalTypes] = useState(initialAnimalTypes);
  const [query, setQuery] = useState<DirectoryQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const current: DirectoryQuery = query ?? { page: 1, sort: "Featured", filters: emptyFilters };

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(query.page), limit: String(PAGE_SIZE), sort: query.sort === "Newest" ? "newest" : query.sort === "Highest Rated" ? "rating" : "featured" });
    if (query.filters.minRating !== null) params.set("minRating", String(query.filters.minRating));
    if (query.filters.membershipTypes.length === 1) params.set("membershipType", query.filters.membershipTypes[0]);
    if (query.filters.animalTypes.length) params.set("animalType", query.filters.animalTypes.join(","));
    if (query.filters.facilities.length) params.set("facilities", query.filters.facilities.join(","));
    if (query.filters.openingHours.length) params.set("openingHours", query.filters.openingHours.join(","));
    void apiClient<Paginated<Practice>>(`/api/practices?${params}`, { signal: controller.signal, cache: "no-store" }, { authenticated: false }).then(async (data) => {
      if (controller.signal.aborted) return;
      if (query.page > Math.max(1, data.totalPages)) {
        params.set("page", String(Math.max(1, data.totalPages)));
        data = await apiClient<Paginated<Practice>>(`/api/practices?${params}`, { signal: controller.signal, cache: "no-store" }, { authenticated: false });
      }
      if (!controller.signal.aborted) setResult(data);
    }).catch((caught) => {
      if (!controller.signal.aborted) setError(caught instanceof ApiClientError ? caught.message : "Practices could not be loaded. Please try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    let refreshing = false;
    function refreshAnimalTypes() {
      if (refreshing || document.visibilityState !== "visible") return;
      refreshing = true;
      void apiClient<AnimalTypeOption[]>("/api/practices/animal-types", { signal: controller.signal, cache: "no-store" }, { authenticated: false }).then((types) => {
        if (!controller.signal.aborted) setAnimalTypes(types);
      }).catch(() => undefined).finally(() => { refreshing = false; });
    }
    refreshAnimalTypes();
    const timer = window.setInterval(refreshAnimalTypes, ANIMAL_TYPES_REFRESH_MS);
    window.addEventListener("focus", refreshAnimalTypes);
    document.addEventListener("visibilitychange", refreshAnimalTypes);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refreshAnimalTypes); document.removeEventListener("visibilitychange", refreshAnimalTypes); };
  }, []);

  function update(next: DirectoryQuery) {
    setLoading(true);
    setError("");
    setQuery(next);
  }

  return (
    <div className="w-full bg-slate-50 py-8 px-4 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl min-w-0 gap-6 lg:grid-cols-[260px_1fr] items-start">
        <FiltersSidebar animalTypes={animalTypes} onChange={(filters) => update({ ...current, filters, page: 1 })} />
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-busy={loading}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SortTabs onChange={(sort) => update({ ...current, sort, page: 1 })} />
            <p className="text-sm text-slate-500" aria-live="polite">{loading ? "Loading practices..." : `${result.total} practices`}</p>
          </div>
          {!error && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-600">{PAGE_SIZE} entries per page</p>
            <DirectoryPagination label="Directory pagination above results" page={result.page} totalPages={result.totalPages} loading={loading} onPageChange={(page) => update({ ...current, page })} />
          </div>}
          <div className="mt-5">
            {loading ? <DirectorySkeleton /> : error ? <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => update({ ...current })} className="mt-2 font-semibold underline">Try again</button></div> : result.items.length ? <VetGrid vets={result.items.map(toPracticeCard)} /> : <p className="py-12 text-center text-slate-500">No practices match these filters.</p>}
          </div>
          {!error && <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500" aria-live="polite">Showing {result.total ? (result.page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(result.page * PAGE_SIZE, result.total)} of {result.total} entries</p>
            <DirectoryPagination page={result.page} totalPages={result.totalPages} loading={loading} onPageChange={(page) => update({ ...current, page })} />
          </div>}
        </div>
      </div>
    </div>
  );
}
