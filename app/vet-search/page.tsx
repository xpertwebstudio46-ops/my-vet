import Hero from "@/components/find-a-vet/Hero";
import FindVetClient from "@/components/find-a-vet/FindVetClient";
import { getPractices, getPracticeAnimalTypes } from "@/lib/api/server";
import type { PracticeMembershipType } from "@/lib/api/types";

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
  const membershipTypeValue = Array.isArray(params.membershipType) ? params.membershipType[0] : params.membershipType;
  const membershipType: PracticeMembershipType | undefined = membershipTypeValue === "INDEPENDENT" || membershipTypeValue === "GROUP" ? membershipTypeValue : undefined;
  const sort = sortValue === "newest" || sortValue === "name" ? sortValue : "rating";
  const [result, serviceSource, animalTypes] = await Promise.all([
    getPractices({ page, limit: 10, sort, q, city, animalType, service, membershipType }),
    getPractices({ page: 1, limit: 100, sort: "name" }),
    getPracticeAnimalTypes(),
  ]);
  const serviceOptions = [...new Set(serviceSource.items.flatMap((practice) => practice.services?.map((item) => item.name) ?? []))].sort((a, b) => a.localeCompare(b));
  const initialQuery = new URLSearchParams({ page: String(page), sort });
  for (const [key, value] of Object.entries({ q, city, animalType, service, membershipType })) if (value) initialQuery.set(key, value);

  return (
    <>
      <Hero />
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <FindVetClient key={initialQuery.toString()} initialResult={result} initialQuery={initialQuery.toString()} initialAnimalTypes={animalTypes} serviceOptions={serviceOptions} />
        </div>
      </section>
    </>
  );
}
