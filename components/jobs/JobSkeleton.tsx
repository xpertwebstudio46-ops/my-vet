export default function JobSkeleton() {
  return <div role="status" aria-label="Loading jobs" className="space-y-4"><span className="sr-only">Loading...</span>{[1, 2, 3].map((i) => <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="mb-4 h-5 w-2/3 rounded bg-slate-200" /><div className="mb-3 h-4 w-1/3 rounded bg-slate-100" /><div className="h-12 rounded bg-slate-100" /></div>)}</div>
}
