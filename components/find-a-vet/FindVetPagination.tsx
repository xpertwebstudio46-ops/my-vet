"use client";
import DirectoryPagination from "@/components/directory/DirectoryPagination";
export default function FindVetPagination({ page, totalPages, loading, onPageChange }: { page: number; totalPages: number; loading: boolean; onPageChange: (page: number) => void }) {
  return <DirectoryPagination label="Find a Vet pagination" page={page} totalPages={totalPages} loading={loading} onPageChange={onPageChange} />;
}
