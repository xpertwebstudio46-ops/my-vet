import { Save } from 'lucide-react'

export function PricingBanner({ onSave }: { onSave: () => void }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          Pricing
        </h1>
        <p className="dashboard-font mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage consultation fees, emergency pricing and care package rates.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
      >
        <Save className="size-4" />
        Save Pricing
      </button>
    </section>
  )
}
