import { cn } from '@/lib/utils'
import type { BoostPlan } from './featured-listing-types'

export function BoostPlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: BoostPlan
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        'w-full rounded-md border bg-white p-4 shadow-lg shadow-black/5 transition-colors',
        selected
          ? 'border-[#064071] bg-white'
          : 'border-gray-200 hover:border-[#064071]/50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-black">{plan.name}</h3>
          <p
            className={cn(
              'mt-2 text-2xl font-bold',
              selected ? 'text-[#064071]' : 'text-[#01AEAD]',
            )}
          >
            {plan.price}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">
            {plan.tag}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {plan.description}
      </p>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            'inline-flex h-9 shrink-0 mt-2 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors',
            selected
              ? 'border-[#064071] bg-[#064071] text-white'
              : 'border-gray-200 bg-white text-black hover:bg-slate-50',
          )}
        >
          Select
        </button>
    </div>
  )
}
