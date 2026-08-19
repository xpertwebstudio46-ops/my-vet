import type { ContactTab } from './contact-types'

const tabs: ContactTab[] = ['New', 'Archived', 'Replied', 'All']

export function ContactTabs({
  active,
  counts,
  onChange,
}: {
  active: ContactTab
  counts: Record<ContactTab, number>
  onChange: (tab: ContactTab) => void
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
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
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
