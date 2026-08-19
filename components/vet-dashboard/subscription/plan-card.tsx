import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from './subscription-types'

export function PlanCard({
  plan,
  active,
  onSelect,
}: {
  plan: SubscriptionPlan
  active: boolean
  onSelect: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect()
      }}
      className={cn(
        'flex min-h-44 w-full cursor-pointer flex-col rounded-md border bg-white p-4 text-left shadow-lg shadow-black/5 transition-colors',
        active ? 'border-[#064071]' : 'border-gray-200 hover:border-[#064071]/50',
      )}
    >
      <div>
        <div>
          <h3 className="text-base font-bold text-black">{plan.name}</h3>
          <p className="mt-3 text-3xl font-bold text-[#01AEAD]">
            {plan.price}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              per month
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {plan.description}
      </p>

      {active && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
          className="mt-2 inline-flex h-9  w-fit items-center justify-center rounded-md bg-[#064071] px-3 text-xs font-semibold text-white"
        >
          Your plan
        </button>
      )}
    </div>
  )
}
