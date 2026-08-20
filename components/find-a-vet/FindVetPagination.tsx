import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

function href(page: number, sort: string) {
  const query = new URLSearchParams({ page: String(page), sort });
  return `/vet-search?${query.toString()}`;
}

export default function FindVetPagination({ page, totalPages, sort }: { page: number; totalPages: number; sort: string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2));
  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="border rounded-full border-gray-500/60"><PaginationPrevious href={href(Math.max(1, page - 1), sort)} /></PaginationItem>
          {pages.map((number) => (
            <PaginationItem key={number} className="border rounded-full border-gray-500/60">
              <PaginationLink href={href(number, sort)} isActive={number === page}>{number}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem className="border rounded-full border-gray-500/60"><PaginationNext href={href(Math.min(totalPages, page + 1), sort)} /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
