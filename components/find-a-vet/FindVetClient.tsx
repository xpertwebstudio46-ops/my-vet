"use client";

import { useEffect, useState } from "react";
import FindVetFilters from "./FindVetFilters";
import FindVetToolbar from "./FindVetToolbar";
import FindVetPagination from "./FindVetPagination";
import VetGrid from "./VetGrid";
import DirectorySkeleton from "@/components/directory/DirectorySkeleton";
import type { AnimalTypeOption } from "@/components/directory/Bar";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Paginated, Practice } from "@/lib/api/types";
import { toPracticeCard } from "@/lib/practice-cards";

const PAGE_SIZE = 10;

export default function FindVetClient({ initialResult, initialQuery, initialAnimalTypes, serviceOptions }: { initialResult: Paginated<Practice>; initialQuery: string; initialAnimalTypes: AnimalTypeOption[]; serviceOptions: string[] }) {
  const [result, setResult] = useState(initialResult);
  const [request, setRequest] = useState<{ query: string } | null>(null);
  const [animalTypes, setAnimalTypes] = useState(initialAnimalTypes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const query = request?.query ?? initialQuery;
  const params = new URLSearchParams(query);

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    const search = new URLSearchParams(request.query);
    search.set("limit", String(PAGE_SIZE));
    void apiClient<Paginated<Practice>>(`/api/practices?${search}`, { signal: controller.signal, cache: "no-store" }, { authenticated: false }).then(async (data) => {
      if (controller.signal.aborted) return;
      if (Number(search.get("page")) > Math.max(1, data.totalPages)) {
        search.set("page", String(Math.max(1, data.totalPages)));
        data = await apiClient<Paginated<Practice>>(`/api/practices?${search}`, { signal: controller.signal, cache: "no-store" }, { authenticated: false });
      }
      if (!controller.signal.aborted) setResult(data);
    }).catch((caught) => {
      if (!controller.signal.aborted) setError(caught instanceof ApiClientError ? caught.message : "Practices could not be loaded. Please try again.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    const controller = new AbortController();
    let refreshing = false;
    function refresh() {
      if (refreshing || document.visibilityState !== "visible") return;
      refreshing = true;
      void apiClient<AnimalTypeOption[]>("/api/practices/animal-types", { signal: controller.signal, cache: "no-store" }, { authenticated: false }).then((types) => {
        if (!controller.signal.aborted) setAnimalTypes(types);
      }).catch(() => undefined).finally(() => { refreshing = false; });
    }
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  function update(next: string) {
    setLoading(true);
    setError("");
    setRequest({ query: next });
    window.history.replaceState(null, "", next ? `/vet-search?${next}` : "/vet-search");
  }
  function changePage(page: number) {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    update(next.toString());
  }

  return <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8 items-start">
    <FindVetFilters serviceOptions={serviceOptions} animalTypes={animalTypes} query={query} onChange={update} />
    <div className="min-w-0 space-y-6 sm:space-y-8" aria-busy={loading}>
      <FindVetToolbar total={result.total} currentSort={params.get("sort") ?? "rating"} onSortChange={(sort) => { const next = new URLSearchParams(query); next.set("sort", sort); next.delete("page"); update(next.toString()); }} />
      {loading ? <DirectorySkeleton /> : error ? <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => update(query)} className="mt-2 font-semibold underline">Try again</button></div> : result.items.length ? <VetGrid practices={result.items.map(toPracticeCard)} /> : <p className="py-12 text-center text-slate-500">No practices match these filters.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><p aria-live="polite" className="text-sm text-slate-500">{loading ? "Loading practices..." : `Showing ${result.total ? (result.page - 1) * PAGE_SIZE + 1 : 0}–${Math.min(result.page * PAGE_SIZE, result.total)} / ${result.total} total entries`}</p><FindVetPagination page={result.page} totalPages={result.totalPages} loading={loading} onPageChange={changePage} /></div>
    </div>
  </div>;
}
