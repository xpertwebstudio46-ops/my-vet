import { cn } from '@/lib/utils'
import type { VetNotification, VetNotificationCategory } from './notification-types'

type NotificationTab = 'All' | VetNotificationCategory

const tabs: NotificationTab[] = [
  'All',
  'Appointments',
  'Enquiries',
  'Reviews',
  'Reminders',
]

export function NotificationTabs({
  activeTab,
  items,
  onChange,
}: {
  activeTab: NotificationTab
  items: VetNotification[]
  onChange: (tab: NotificationTab) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = activeTab === tab
        const count =
          tab === 'All'
            ? items.length
            : items.filter((item) => item.category === tab).length

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors',
              selected
                ? 'bg-[#01AEAD] text-white'
                : 'bg-white text-slate-600 hover:bg-[#EEF7F5] hover:text-[#01AEAD]',
            )}
          >
            {tab}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export type { NotificationTab }
