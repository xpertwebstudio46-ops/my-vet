import { CreditCard } from 'lucide-react'

export function PaymentMethodCard() {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Payment method</h2>
      </div>

      <div className="mt-5 rounded-md border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-[#064071] text-white">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black">Visa ending 4242</p>
            <p className="mt-1 text-xs text-muted-foreground">Expires 9/28</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-black shadow-md shadow-black/10 hover:bg-slate-50"
          >
            Change card
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate-600 hover:text-black"
          >
            Add backup
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-md bg-slate-100 p-4">
        <h3 className="text-sm font-semibold text-black">Billing contact</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-1 font-semibold text-black">
              billing@greenpawsvet.co.uk
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">VAT number</dt>
            <dd className="mt-1 font-semibold text-black">GB 245 8812 09</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
