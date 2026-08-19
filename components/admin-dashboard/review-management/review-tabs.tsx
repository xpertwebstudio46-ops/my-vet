import type { ReviewStatus } from './review-card'

export type ReviewTab = 'All' | ReviewStatus

const tabs: ReviewTab[] = ['Pending', 'Reported', 'Published', 'All']

export function ReviewTabs({
  active,
  counts,
  onChange,
}: {
  active: ReviewTab
  counts: Record<ReviewTab, number>
  onChange: (tab: ReviewTab) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200/80 p-4">
      {tabs.map((tab) => {
        const selected = active === tab

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
              selected
                ? 'bg-[#01AEAD] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-[#EEF7F5] hover:text-[#01AEAD]'
            }`}
          >
            {tab}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                selected ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
