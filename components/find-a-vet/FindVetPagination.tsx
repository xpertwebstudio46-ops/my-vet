import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Filters = { q?: string; city?: string; animalType?: string; service?: string };

function href(page: number, sort: string, filters: Filters) {
  const query = new URLSearchParams({ page: String(page), sort });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  return `/vet-search?${query.toString()}`;
}

export default function FindVetPagination({ page, totalPages, sort, filters }: { page: number; totalPages: number; sort: string; filters: Filters }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2));
  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="border rounded-full border-gray-500/60"><PaginationPrevious href={href(Math.max(1, page - 1), sort, filters)} /></PaginationItem>
          {pages.map((number) => (
            <PaginationItem key={number} className="border rounded-full border-gray-500/60">
              <PaginationLink href={href(number, sort, filters)} isActive={number === page}>{number}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem className="border rounded-full border-gray-500/60"><PaginationNext href={href(Math.min(totalPages, page + 1), sort, filters)} /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
