import { Eye, Sparkles } from 'lucide-react'

export function VetDashboardBanner() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          Good morning, Amelia
        </h1>
        <p className="dashboard-font mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage your practice profile, enquiries, reviews and subscription from
          one dashboard.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-black hover:bg-slate-50"
        >
          <Eye className="size-4 text-slate-400" />
          View public listing
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
        >
          <Sparkles className="size-4" />
          Upgrade listing
        </button>
      </div>
    </section>
  )
}
