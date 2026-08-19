import VetCard from "./CardVet";

// components/find-a-vet/VetCard.tsx
export interface VetCardData {
  slug: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured?: boolean;
}


export default function VetGrid({
  vets,
  onLoadMore,
  hasMore = false,
}: {
  vets: VetCardData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5">
        {vets.map((vet) => (
          <VetCard key={vet.slug} vet={vet} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
          >
            Load More Practices
          </button>
        </div>
      )}
    </div>
  );
}