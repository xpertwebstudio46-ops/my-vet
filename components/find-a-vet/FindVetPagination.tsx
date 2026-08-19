import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const FindVetPagination = () => {
  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent className="">
          <PaginationItem className="border rounded-full border-gray-500/60">
            <PaginationPrevious href="#" />
          </PaginationItem>

          <PaginationItem className="border rounded-full border-gray-500/60">
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>

          <PaginationItem className="border rounded-full border-gray-500/60">
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>

          <PaginationItem className="border rounded-full border-gray-500/60">
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          <PaginationItem className="border rounded-full border-gray-500/60">
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default FindVetPagination;