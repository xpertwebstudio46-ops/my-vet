export default function Loading() {
  return <div role="status" aria-label="Loading call-out areas" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((number) => <div key={number} className="h-72 animate-pulse rounded-2xl bg-slate-200" />)}<span className="sr-only">Loading...</span></div>
}
