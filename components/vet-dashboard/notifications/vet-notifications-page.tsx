'use client'

import { useMemo, useState } from 'react'
import { NotificationList } from './notification-list'
import { NotificationTabs, type NotificationTab } from './notification-tabs'
import { NotificationsBanner } from './notifications-banner'
import type { VetNotification } from './notification-types'

const initialNotifications: VetNotification[] = [
  {
    id: 'vet-note-1',
    title: 'New enquiry received',
    body: 'Mia Thompson asked about same-day availability for Mochi.',
    time: '12 min ago',
    category: 'Enquiries',
    unread: true,
  },
  {
    id: 'vet-note-2',
    title: 'Review reply pending',
    body: 'A five-star review is waiting for your response.',
    time: '42 min ago',
    category: 'Reviews',
    unread: true,
  },
  {
    id: 'vet-note-3',
    title: 'Appointment confirmed',
    body: 'Oscar Reed confirmed tomorrow morning consultation.',
    time: '2 hrs ago',
    category: 'Appointments',
    unread: false,
  },
  {
    id: 'vet-note-4',
    title: 'Profile update reminder',
    body: 'Add new gallery media to keep your listing fresh.',
    time: 'Yesterday',
    category: 'Reminders',
    unread: true,
  },
]

export function VetNotificationsPage() {
  const [items, setItems] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState<NotificationTab>('All')

  const visibleItems = useMemo(() => {
    if (activeTab === 'All') return items
    return items.filter((item) => item.category === activeTab)
  }, [activeTab, items])

  const unreadCount = items.filter((item) => item.unread).length

  return (
    <div className="space-y-6">
      <NotificationsBanner
        onMarkAllRead={() =>
          setItems((current) =>
            current.map((item) => ({ ...item, unread: false })),
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NotificationTabs
          activeTab={activeTab}
          items={items}
          onChange={setActiveTab}
        />
        {unreadCount > 0 && (
          <span className="w-fit rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">
            {unreadCount} unread
          </span>
        )}
      </div>

      <NotificationList
        items={visibleItems}
        onRead={(id) =>
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, unread: false } : item,
            ),
          )
        }
      />
    </div>
  )
}
