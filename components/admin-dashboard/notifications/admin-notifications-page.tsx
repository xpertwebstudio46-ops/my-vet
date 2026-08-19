'use client'

import { useMemo, useState } from 'react'
import {
  Bell,
  ClipboardCheck,
  Inbox,
  MessageSquareWarning,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'
import { AdminPageBanner } from '../shared/admin-page-banner'

type AdminNotificationCategory =
  | 'Approvals'
  | 'Reviews'
  | 'Security'
  | 'System'

type AdminNotification = {
  id: string
  title: string
  body: string
  time: string
  category: AdminNotificationCategory
  unread: boolean
}

const initialNotifications: AdminNotification[] = [
  {
    id: 'admin-note-1',
    title: 'Practice approval waiting',
    body: 'Willow Farm Veterinary submitted RCVS documents for review.',
    time: '12 min ago',
    category: 'Approvals',
    unread: true,
  },
  {
    id: 'admin-note-2',
    title: 'Reported review needs attention',
    body: 'A pet owner review for CityVet Wellness Clinic was reported.',
    time: '38 min ago',
    category: 'Reviews',
    unread: true,
  },
  {
    id: 'admin-note-3',
    title: 'New admin login detected',
    body: 'A successful admin login was recorded from a new browser.',
    time: '2 hrs ago',
    category: 'Security',
    unread: false,
  },
  {
    id: 'admin-note-4',
    title: 'Subscription payment processed',
    body: 'Premium plan billing completed for Oakridge Equine Care.',
    time: '5 hrs ago',
    category: 'System',
    unread: false,
  },
  {
    id: 'admin-note-5',
    title: 'New pet owner signup',
    body: 'A new pet owner account was created in Bicester.',
    time: 'Yesterday',
    category: 'System',
    unread: true,
  },
]

const tabs: Array<'All' | AdminNotificationCategory> = [
  'All',
  'Approvals',
  'Reviews',
  'Security',
  'System',
]

const categoryIcons: Record<AdminNotificationCategory, LucideIcon> = {
  Approvals: ClipboardCheck,
  Reviews: MessageSquareWarning,
  Security: ShieldCheck,
  System: Bell,
}

export function AdminNotificationsPage() {
  const [items, setItems] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All')

  const visibleItems = useMemo(() => {
    if (activeTab === 'All') return items
    return items.filter((item) => item.category === activeTab)
  }, [activeTab, items])

  const unreadCount = items.filter((item) => item.unread).length

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Notifications"
        description="Admin alerts for approvals, reviews, account security and platform activity."
        action={{
          label: 'Mark all as read',
          icon: 'download',
          tone: 'outline',
          onClick: () =>
            setItems((current) =>
              current.map((item) => ({ ...item, unread: false })),
            ),
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                onClick={() => setActiveTab(tab)}
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

        {unreadCount > 0 && (
          <span className="w-fit rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">
            {unreadCount} unread
          </span>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#EEF7F5] text-[#01AEAD]">
            <Inbox className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-black">
            Nothing here yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            New admin notifications will appear here when there is activity.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          {visibleItems.map((item) => {
            const Icon = categoryIcons[item.category]

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setItems((current) =>
                    current.map((notification) =>
                      notification.id === item.id
                        ? { ...notification, unread: false }
                        : notification,
                    ),
                  )
                }
                className={cn(
                  'flex w-full items-start gap-3 border-b border-gray-200/80 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-50',
                  item.unread && 'bg-[#EEF7F5]/50',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full',
                    item.unread
                      ? 'bg-[#01AEAD] text-white'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-black">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.body}
                  </span>
                </span>

                {item.unread && (
                  <span className="mt-3 size-2 shrink-0 rounded-full bg-[#01AEAD]" />
                )}
              </button>
            )
          })}
        </Card>
      )}
    </div>
  )
}
