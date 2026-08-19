import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { PriceItem } from './pricing-types'

type PricingCardProps = {
  title: string
  items: PriceItem[]
  onPriceChange: (index: number, value: string) => void
  onEdit: (index: number) => void
  onDelete: (index: number) => void
  onAdd: () => void
}

export function PricingCard({
  title,
  items,
  onPriceChange,
  onEdit,
  onDelete,
  onAdd,
}: PricingCardProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 pb-4">
        <h2 className="text-base font-semibold text-black">{title}</h2>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              {item.label}
            </p>
            <input
              type="text"
              value={item.price}
              onChange={(event) => onPriceChange(index, event.target.value)}
              aria-label={`${item.label} price`}
              className="h-10 w-full rounded-md border border-transparent bg-transparent px-0 text-right text-sm font-bold text-[#01AEAD] outline-none focus:bg-[#01AEAD]/5 focus:px-3 focus:ring-3 focus:ring-[#01AEAD]/15 sm:w-28"
            />
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-slate-400 hover:bg-slate-50 hover:text-[#064071]"
                aria-label={`Edit ${item.label}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${item.label}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-[#064071] hover:bg-slate-50"
      >
        <Plus className="size-4 text-[#01AEAD]" />
        Add
      </button>
    </section>
  )
}
