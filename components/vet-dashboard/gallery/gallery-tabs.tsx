import type { GalleryTab } from './gallery-types'

type GalleryTabsProps = {
  activeTab: GalleryTab
  counts: Record<GalleryTab, number>
  onChange: (tab: GalleryTab) => void
}

const tabs: Array<{ label: string; value: GalleryTab }> = [
  { label: 'All', value: 'all' },
  { label: 'Photos', value: 'photo' },
  { label: 'Videos', value: 'video' },
]

export function GalleryTabs({
  activeTab,
  counts,
  onChange,
}: GalleryTabsProps) {
  return (
    <div className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1 shadow-lg shadow-black/10">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === tab.value
              ? 'bg-[#064071] text-white'
              : 'text-muted-foreground hover:bg-slate-50 hover:text-black'
          }`}
        >
          {tab.label} ({counts[tab.value]})
        </button>
      ))}
    </div>
  )
}
