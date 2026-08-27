function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />
}

export function DashboardLoadingSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading dashboard page"
    >
      <section className="rounded-2xl bg-white p-4 shadow-lg shadow-black/10 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-12 w-56 max-w-full" />
            <SkeletonBlock className="h-4 w-80 max-w-full" />
          </div>
          <SkeletonBlock className="h-11 w-full sm:w-36" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <section
            key={index}
            className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-8 w-20" />
              </div>
              <SkeletonBlock className="size-11 rounded-xl" />
            </div>
          </section>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10 sm:p-5">
          <div className="border-b border-gray-200/80 pb-4">
            <SkeletonBlock className="h-5 w-44" />
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-gray-200/80 pb-4 last:border-b-0 sm:gap-4"
              >
                <SkeletonBlock className="size-12 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-48 max-w-full" />
                  <SkeletonBlock className="h-3 w-72 max-w-full" />
                </div>
                <SkeletonBlock className="h-9 w-20" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10 sm:p-5">
          <div className="border-b border-gray-200/80 pb-4">
            <SkeletonBlock className="h-5 w-36" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-12 w-full" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
