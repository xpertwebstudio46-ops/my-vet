import type { HealthPackage } from './pricing-types'

type HealthPackagesCardProps = {
  packages: HealthPackage[]
  onPriceChange: (id: string, value: string) => void
}

export function HealthPackagesCard({
  packages,
  onPriceChange,
}: HealthPackagesCardProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">Health packages</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly plans owners can sign up to at reception.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {packages.map((item) => (
          <div key={item.id} className="rounded-md border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-black">{item.name}</h3>
            </div>
              <input
                type="text"
                value={item.price}
                onChange={(event) => onPriceChange(item.id, event.target.value)}
                className="h-9 w-24 rounded-md border border-transparent bg-transparent px-0 text-left text-[20px] font-semibold text-[#01AEAD] outline-none focus:bg-[#01AEAD]/5 focus:px-3 focus:ring-3 focus:ring-[#01AEAD]/15"
                aria-label={`${item.name} price`}
              />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
