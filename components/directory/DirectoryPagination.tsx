"use client";

export default function DirectoryPagination({ page, totalPages, loading, onPageChange, label = "Directory pagination" }: { page: number; totalPages: number; loading: boolean; onPageChange: (page: number) => void; label?: string }) {
  const lastPage = Math.max(1, totalPages);
  const pages = [...new Set([1, page - 1, page, page + 1, lastPage])].filter((number) => number >= 1 && number <= lastPage).sort((a, b) => a - b);
  return (
    <nav aria-label={label} className="flex max-w-full flex-wrap items-center gap-1.5">
      <button type="button" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border px-3 py-2 text-sm text-[#064071] focus-visible:outline-2 focus-visible:outline-[#13b8a8] disabled:opacity-40">Previous</button>
      {pages.map((number, index) => <span key={number} className="flex items-center gap-1.5">
        {index > 0 && number - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-slate-400">…</span>}
        <button type="button" disabled={loading} aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined} onClick={() => onPageChange(number)} className={`min-w-9 rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#13b8a8] disabled:opacity-40 ${number === page ? "border-[#064071] bg-[#064071] text-white" : "text-[#064071]"}`}>{number}</button>
      </span>)}
      <button type="button" disabled={loading || page >= lastPage} onClick={() => onPageChange(page + 1)} className="rounded-lg border px-3 py-2 text-sm text-[#064071] focus-visible:outline-2 focus-visible:outline-[#13b8a8] disabled:opacity-40">Next</button>
    </nav>
  );
}
