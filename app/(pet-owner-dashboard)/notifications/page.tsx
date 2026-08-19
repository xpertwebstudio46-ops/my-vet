'use client'

import { useMemo, useState } from 'react'
import {
  Bell,
  CalendarCheck,
  Inbox,
  MessageSquare,
  Reply,
  type LucideIcon,
} from 'lucide-react'
import { notifications as initial, type NotificationItem } from '@/lib/dashboard-data'
import { Card, Tabs } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { cn } from '@/lib/utils'

const categoryIcon: Record<NotificationItem['category'], LucideIcon> = {
  Appointment: CalendarCheck,
  Replies: Reply,
  Messages: MessageSquare,
  Reminders: Bell,
}

const tabs = ['All', 'Replies', 'Messages', 'Reminders']

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(initial)
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () =>
      active === 'All'
        ? items
        : items.filter((n) => n.category === active),
    [items, active],
  )

  const unreadCount = items.filter((n) => n.unread).length

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-5  shadow-lg shadow-black/10">
        <div>
          <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">
            Notifications
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Appointment updates, replies to your reviews and messages from
            practices.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
          className="text-sm font-semibold text-black border  border-gray-400/20 rounded-md p-2.5"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <Tabs tabs={tabs} active={active} onChange={setActive} />
        {unreadCount > 0 && (
          <span className="shrink-0 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-semibold text-brand">
            {unreadCount} unread
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing here yet"
          description="You're all caught up. New notifications will appear here."
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((n) => {
            const Icon = categoryIcon[n.category]
            return (
              <button
                key={n.id}
                type="button"
                onClick={() =>
                  setItems((prev) =>
                    prev.map((it) =>
                      it.id === n.id ? { ...it, unread: false } : it,
                    ),
                  )
                }
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50',
                  n.unread && 'bg-brand-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                    n.unread
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {n.body}
                  </p>
                </div>
                {n.unread && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                )}
              </button>
            )
          })}
        </Card>
      )}
    </div>
  )
}
