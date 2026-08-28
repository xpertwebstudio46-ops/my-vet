import Hero from "@/components/find-a-vet/Hero";
import FindVetFilters from "@/components/find-a-vet/FindVetFilters";
import FindVetToolbar from "@/components/find-a-vet/FindVetToolbar";
import VetGrid from "@/components/find-a-vet/VetGrid";
import FindVetPagination from "@/components/find-a-vet/FindVetPagination";
import { getPractices } from "@/lib/api/server";
import { toPracticeCard } from "@/lib/practice-cards";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);
  const sortValue = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const city = Array.isArray(params.city) ? params.city[0] : params.city;
  const animalType = Array.isArray(params.animalType) ? params.animalType[0] : params.animalType;
  const service = Array.isArray(params.service) ? params.service[0] : params.service;
  const sort = sortValue === "newest" || sortValue === "name" ? sortValue : "rating";
  const result = await getPractices({ page, limit: 12, sort, q, city, animalType, service });

  return (
    <>
      <Hero />
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8 items-start">
            <FindVetFilters />
            <div className="min-w-0 space-y-6 sm:space-y-8">
              <FindVetToolbar total={result.total} />
              <VetGrid practices={result.items.map(toPracticeCard)} />
              <FindVetPagination page={result.page} totalPages={result.totalPages} sort={sort} filters={{ q, city, animalType, service }} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
