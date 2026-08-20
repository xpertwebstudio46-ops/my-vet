"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FindVetToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "rating";

  function changeSort(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 bg-white border border-gray-500/15 rounded-lg shadow-lg p-5 md:flex-row md:items-center md:justify-between">
      <h2 className="text-[16px] font-medium text-[#475569]">Showing <span className="font-bold text-[#064071]">{total}</span> Practices</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Sort By</span>
        <Select value={currentSort} onValueChange={changeSort}>
          <SelectTrigger className="w-[200px] rounded-md bg-gray-500/10 p-5 border-gray-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
