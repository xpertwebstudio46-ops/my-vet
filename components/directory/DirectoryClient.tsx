"use client";

import { useEffect, useState } from "react";
import FiltersSidebar, { type AnimalTypeOption, type FiltersState } from "@/components/directory/Bar";
import SortTabs, { type SortTab } from "@/components/directory/SortTab";
import VetGrid from "@/components/directory/GridVet";
import { toPracticeCard } from "@/lib/practice-cards";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Paginated, Practice } from "@/lib/api/types";

const PAGE_SIZE = 10;
const emptyFilters: FiltersState = { minRating: null, membershipTypes: [], facilities: [], openingHours: [], animalTypes: [] };
type DirectoryQuery = { page: number; sort: SortTab; filters: FiltersState };

export default function DirectoryClient({ initialResult, initialAnimalTypes }: { initialResult: Paginated<Practice>; initialAnimalTypes: AnimalTypeOption[] }) {
  const [result, setResult] = useState(initialResult);
  const [animalTypes, setAnimalTypes] = useState(initialAnimalTypes);
  const [query, setQuery] = useState<DirectoryQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const current = query ? { ...query, page: result.page } : { page: 1, sort: "Featured", filters: emptyFilters };

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(query.page), limit: String(PAGE_SIZE), sort: query.sort === "Newest" ? "newest" : query.sort === "Highest Rated" ? "rating" : "featured" });
    if (query.filters.minRating !== null) params.set("minRating", String(query.filters.minRating));
    if (query.filters.membershipTypes.length === 1) params.set("membershipType", query.filters.membershipTypes[0]);
    if (query.filters.animalTypes.length) params.set("animalType", query.filters.animalTypes.join(","));
    if (query.filters.facilities.length) params.set("facilities", query.filters.facilities.join(","));
    if (query.filters.openingHours.length) params.set("openingHours", query.filters.openingHours.join(","));
    void apiClient<Paginated<Practice>>(`/api/practices?${params}`, { signal: controller.signal }, { authenticated: false }).then(async (data) => {
      if (controller.signal.aborted) return;
      if (query.page > Math.max(1, data.totalPages)) {
        params.set("page", String(Math.max(1, data.totalPages)));
        data = await apiClient<Paginated<Practice>>(`/api/practices?${params}`, { signal: controller.signal }, { authenticated: false });
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
    function refreshAnimalTypes() {
      void apiClient<AnimalTypeOption[]>("/api/practices/animal-types", { signal: controller.signal }, { authenticated: false }).then((types) => {
        if (!controller.signal.aborted) setAnimalTypes(types);
      }).catch(() => undefined);
    }
    window.addEventListener("focus", refreshAnimalTypes);
    return () => { controller.abort(); window.removeEventListener("focus", refreshAnimalTypes); };
  }, []);

  function update(next: DirectoryQuery) {
    setLoading(true);
    setError("");
    setQuery(next);
  }

  const pageCount = Math.max(1, result.totalPages);
  const pages = [...new Set([1, current.page - 1, current.page, current.page + 1, pageCount])].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);

  return (
    <div className="w-full bg-slate-50 py-8 px-4 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl min-w-0 gap-6 lg:grid-cols-[260px_1fr] items-start">
        <FiltersSidebar animalTypes={animalTypes} onChange={(filters) => update({ ...current, filters, page: 1 })} />
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-busy={loading}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SortTabs onChange={(sort) => update({ ...current, sort, page: 1 })} />
            <p className="text-sm text-slate-500" aria-live="polite">{loading ? "Loading practices..." : `${result.total} practices`}</p>
          </div>
          <div className="mt-5">
            {loading ? <DirectorySkeleton /> : error ? <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => update({ ...current })} className="mt-2 font-semibold underline">Try again</button></div> : result.items.length ? <VetGrid vets={result.items.map(toPracticeCard)} /> : <p className="py-12 text-center text-slate-500">No practices match these filters.</p>}
          </div>
          {!loading && !error && <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500" aria-live="polite">Showing {result.total ? (result.page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(result.page * PAGE_SIZE, result.total)} of {result.total} entries</p>
            {result.totalPages > 1 && <nav aria-label="Directory pagination" className="flex max-w-full flex-wrap items-center gap-1.5">
              <button type="button" disabled={current.page <= 1} onClick={() => update({ ...current, page: current.page - 1 })} className="rounded-lg border px-3 py-2 text-sm text-[#064071] disabled:opacity-40">Previous</button>
              {pages.map((page, index) => <span key={page} className="flex items-center gap-1.5">{index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-slate-400">…</span>}<button type="button" aria-label={`Page ${page}`} aria-current={page === current.page ? "page" : undefined} onClick={() => update({ ...current, page })} className={`min-w-9 rounded-lg border px-3 py-2 text-sm ${page === current.page ? "border-[#064071] bg-[#064071] text-white" : "text-[#064071]"}`}>{page}</button></span>)}
              <button type="button" disabled={current.page >= result.totalPages} onClick={() => update({ ...current, page: current.page + 1 })} className="rounded-lg border px-3 py-2 text-sm text-[#064071] disabled:opacity-40">Next</button>
            </nav>}
          </div>}
        </div>
      </div>
    </div>
  );
}

function DirectorySkeleton() {
  return <div role="status" aria-label="Loading practices" className="grid gap-5 sm:grid-cols-2"><span className="sr-only">Loading practices...</span>{Array.from({ length: PAGE_SIZE }, (_, index) => <div key={index} aria-hidden="true" className="overflow-hidden rounded-2xl border border-slate-200 motion-safe:animate-pulse"><div className="h-40 bg-slate-200" /><div className="space-y-3 p-4"><div className="h-5 w-3/4 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-100" /><div className="h-12 rounded bg-slate-100" /><div className="h-9 rounded bg-slate-200" /></div></div>)}</div>;
}
