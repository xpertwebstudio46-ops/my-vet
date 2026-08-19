import { Download } from 'lucide-react'

export function AnalyticsBanner() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          Analytics
        </h1>
        <p className="dashboard-font mt-1 max-w-2xl text-sm text-muted-foreground">
          Track profile views, contact actions and listing performance.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md border border-[#064071] bg-transparent px-4 text-sm font-semibold text-[#064071] hover:bg-[#064071] hover:text-white"
      >
        <Download className="size-4" />
        Export
      </button>
    </section>
  )
}

