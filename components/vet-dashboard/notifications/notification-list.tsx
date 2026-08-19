import {
  Bell,
  CalendarCheck,
  Inbox,
  MessageSquare,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'
import type { VetNotification, VetNotificationCategory } from './notification-types'

const categoryIcons: Record<VetNotificationCategory, LucideIcon> = {
  Appointments: CalendarCheck,
  Enquiries: MessageSquare,
  Reviews: Star,
  Reminders: Bell,
}

export function NotificationList({
  items,
  onRead,
}: {
  items: VetNotification[]
  onRead: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#EEF7F5] text-[#01AEAD]">
          <Inbox className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-black">
          Nothing here yet
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          New vet dashboard notifications will appear here when there is activity.
        </p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      {items.map((item) => {
        const Icon = categoryIcons[item.category]

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onRead(item.id)}
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
  )
}
