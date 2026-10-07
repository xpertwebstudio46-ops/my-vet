'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'

type ApprovalTab = 'ALL' | 'PENDING' | 'REVIEWED' | 'REJECTED' | 'APPROVED'
type AdminNotification = {
  id: string
  category: string
  title: string
  message: string
  actionUrl: string | null
  statusSnapshot: string | null
  readAt: string | null
  createdAt: string
}
type NotificationCounts = { all: number; pending: number; reviewed: number; rejected: number; approved: number }
type NotificationResult = Paginated<AdminNotification> & { counts: NotificationCounts }

const tabs: { value: ApprovalTab; label: string; countKey: keyof NotificationCounts }[] = [
  { value: 'ALL', label: 'All', countKey: 'all' },
  { value: 'PENDING', label: 'Pending', countKey: 'pending' },
  { value: 'REVIEWED', label: 'Reviewed', countKey: 'reviewed' },
  { value: 'REJECTED', label: 'Rejected', countKey: 'rejected' },
  { value: 'APPROVED', label: 'Approved', countKey: 'approved' },
]

const blankCounts: NotificationCounts = { all: 0, pending: 0, reviewed: 0, rejected: 0, approved: 0 }

export function AdminNotificationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ApprovalTab>(initialApprovalTab)
  const [items, setItems] = useState<AdminNotification[]>([])
  const [counts, setCounts] = useState<NotificationCounts>(blankCounts)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(() => {
    void apiClient<NotificationResult>(`/api/admin/notifications?page=1&limit=100&approvalStatus=${activeTab}`)
      .then((result) => {
        setItems(result.items)
        setCounts(result.counts)
        setError('')
      })
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Notifications could not be loaded.'))
      .finally(() => setLoading(false))
  }, [activeTab])

  const openTab = useCallback((tab: ApprovalTab) => {
    setLoading(true)
    setError('')
    setActiveTab(tab)
    window.history.pushState(null, '', tab === 'ALL' ? '/admin-dashboard/notifications' : `/admin-dashboard/notifications?approvalStatus=${tab}`)
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    window.addEventListener('myvet:notification', loadNotifications)
    return () => window.removeEventListener('myvet:notification', loadNotifications)
  }, [loadNotifications])

  useEffect(() => {
    const openNotificationTab = (event: Event) => {
      const tab = approvalTabFromStatus((event as CustomEvent<string>).detail)
      if (tab) openTab(tab)
    }
    window.addEventListener('myvet:admin-notification-tab', openNotificationTab)
    return () => window.removeEventListener('myvet:admin-notification-tab', openNotificationTab)
  }, [openTab])

  async function readAll() {
    try {
      await apiClient('/api/notifications/read-all', { method: 'PATCH' })
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })))
      window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { all: true } }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Notifications could not be updated.')
    }
  }

  async function read(item: AdminNotification) {
    try {
      if (!item.readAt) {
        await apiClient(`/api/notifications/${item.id}/read`, { method: 'PATCH' })
        setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: new Date().toISOString() } : value))
        window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { id: item.id } }))
      }
      const tab = approvalTabFromStatus(item.statusSnapshot)
      if (tab) {
        openTab(tab)
      } else if (item.actionUrl) {
        router.push(notificationRoute(item.actionUrl))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Notification could not be opened.')
    }
  }

  async function remove(item: AdminNotification) {
    try {
      await apiClient(`/api/notifications/${item.id}`, { method: 'DELETE' })
      setItems((current) => current.filter((value) => value.id !== item.id))
      setCounts((current) => nextCountsAfterDelete(current, item.statusSnapshot))
      window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { id: item.id, deleted: true } }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Notification could not be deleted.')
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader title="Notifications" description="Practice approval updates and admin activity.">
        <button type="button" onClick={() => void readAll()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white">
          <CheckCheck className="size-4" />
          Mark all read
        </button>
      </PageHeader>

      <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              openTab(tab.value)
            }}
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${activeTab === tab.value ? 'bg-[#064071] text-white' : 'text-[#064071] hover:bg-slate-50'}`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.value ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts[tab.countKey]}
            </span>
          </button>
        ))}
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</p>
        ) : items.length ? (
          items.map((item) => (
            <div key={item.id} className={`flex flex-col gap-3 border-b p-4 last:border-0 sm:flex-row sm:gap-4 sm:p-5 ${item.readAt ? 'bg-white' : 'bg-teal-50/50'}`}>
              <div className="flex min-w-0 gap-3 sm:flex-1 sm:gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7F5] text-[#01AEAD]">
                  <Bell className="size-5" />
                </span>
                <button type="button" onClick={() => void read(item)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-semibold text-black">{item.title}</p>
                    {item.statusSnapshot && <StatusBadge status={item.statusSnapshot} />}
                  </div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('en-GB')} &middot; {item.category}</p>
                </button>
              </div>
              <button type="button" onClick={() => void remove(item)} aria-label="Delete notification" className="self-end rounded-md p-2 text-red-600 hover:bg-red-50 sm:self-center">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">No notifications in this tab.</p>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').toLowerCase()
  const tone = status === 'APPROVED'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'REJECTED'
      ? 'bg-red-50 text-red-700'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-600'
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${tone}`}>{label}</span>
}

function nextCountsAfterDelete(counts: NotificationCounts, status: string | null) {
  return {
    all: Math.max(0, counts.all - 1),
    pending: status === 'PENDING' ? Math.max(0, counts.pending - 1) : counts.pending,
    reviewed: status === 'APPROVED' || status === 'REJECTED' ? Math.max(0, counts.reviewed - 1) : counts.reviewed,
    rejected: status === 'REJECTED' ? Math.max(0, counts.rejected - 1) : counts.rejected,
    approved: status === 'APPROVED' ? Math.max(0, counts.approved - 1) : counts.approved,
  }
}

function approvalTabFromStatus(status: string | null): ApprovalTab | null {
  return status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED' ? status : null
}

function initialApprovalTab(): ApprovalTab {
  if (typeof window === 'undefined') return 'ALL'
  const requestedTab = new URLSearchParams(window.location.search).get('approvalStatus')
  return requestedTab === 'PENDING' || requestedTab === 'APPROVED' || requestedTab === 'REJECTED' || requestedTab === 'REVIEWED'
    ? requestedTab
    : 'ALL'
}

function notificationRoute(path: string) {
  return path.startsWith('/') ? path : '/'
}
