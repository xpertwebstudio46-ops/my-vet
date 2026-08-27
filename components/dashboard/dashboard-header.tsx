'use client'

import Link from 'next/link'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRoundCog,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { apiClient } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'

type Notification = {
  id: string
  title: string
  message: string
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

export function DashboardHeader({
  onOpenSidebar,
  onLogout,
  searchAction,
  searchPlaceholder,
  notificationsHref,
  profileHref,
  settingsHref,
  roleLabel,
}: {
  onOpenSidebar: () => void
  onLogout: () => void
  searchAction: string
  searchPlaceholder: string
  notificationsHref: string
  profileHref: string
  settingsHref: string
  roleLabel: string
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState<'notifications' | 'profile' | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void apiClient<Paginated<Notification>>('/api/notifications?page=1&limit=5')
      .then((result) => setNotifications(result.items))
      .catch(() => undefined)
  }, [])
  useEffect(() => {
    const receive = (event: Event) => {
      const item = (event as CustomEvent<Notification>).detail
      setNotifications((current) =>
        [item, ...current.filter((value) => value.id !== item.id)].slice(0, 5),
      )
    }
    window.addEventListener('myvet:notification', receive)
    return () => window.removeEventListener('myvet:notification', receive)
  }, [])
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (
        event as CustomEvent<{ id?: string; all?: boolean; deleted?: boolean }>
      ).detail
      setNotifications((current) =>
        detail.all
          ? current.map((item) => ({
              ...item,
              readAt: item.readAt ?? new Date().toISOString(),
            }))
          : detail.deleted
            ? current.filter((item) => item.id !== detail.id)
            : current.map((item) =>
                item.id === detail.id
                  ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
                  : item,
              ),
      )
    }
    window.addEventListener('myvet:notifications-updated', update)
    return () => window.removeEventListener('myvet:notifications-updated', update)
  }, [])
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const name = user ? `${user.firstName} ${user.lastName}`.trim() : roleLabel
  const unread = notifications.filter((item) => !item.readAt).length

  function markRead(item: Notification) {
    if (item.readAt) return
    void apiClient(`/api/notifications/${item.id}/read`, { method: 'PATCH' })
      .then(() =>
        window.dispatchEvent(
          new CustomEvent('myvet:notifications-updated', {
            detail: { id: item.id },
          }),
        ),
      )
      .catch(() => undefined)
  }

  return (
    <header className="sticky top-0 z-30 flex min-w-0 flex-wrap items-center gap-2 border-b border-black/5 bg-[#F5F6FB]/90 px-3 py-2 backdrop-blur sm:flex-nowrap sm:gap-3 sm:px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      <form
        className="relative order-3 z-0 w-full min-w-0 flex-none sm:order-none sm:max-w-4xl sm:flex-1"
        action={searchAction}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-white bg-white pl-9 pr-4 text-sm shadow-md shadow-black/10 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>
      <div
        ref={container}
        className="relative z-50 ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpen((value) =>
                value === 'notifications' ? null : 'notifications',
              )
            }
            className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-md"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {open === 'notifications' && (
            <div className="fixed left-3 right-3 top-[7.25rem] z-50 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 sm:max-h-none">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <strong className="text-sm">Notifications</strong>
                <Link
                  href={notificationsHref}
                  onClick={() => setOpen(null)}
                  className="text-xs font-semibold text-brand"
                >
                  View all
                </Link>
              </div>
              <ul className="max-h-72 divide-y overflow-y-auto">
                {notifications.length ? (
                  notifications.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={
                          item.actionUrl
                            ? notificationRoute(item.actionUrl)
                            : notificationsHref
                        }
                        onClick={() => {
                          markRead(item)
                          setOpen(null)
                        }}
                        className={`block px-4 py-3 hover:bg-slate-50 ${item.readAt ? '' : 'bg-teal-50/50'}`}
                      >
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.message}
                        </p>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpen((value) => (value === 'profile' ? null : 'profile'))
            }
            className="flex max-w-[11rem] items-center gap-2 rounded-full py-1 pl-1 pr-1 hover:bg-muted sm:pr-2"
          >
            <UserAvatar name={name} className="size-8" />
            <span className="hidden min-w-0 text-left md:block">
              <span className="block truncate text-sm font-semibold">{name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {roleLabel}
              </span>
            </span>
            <ChevronDown className="hidden size-4 sm:block" />
          </button>
          {open === 'profile' && (
            <div className="absolute right-0 top-12 z-50 w-[min(calc(100vw-1.5rem),15rem)] overflow-hidden rounded-xl border bg-white shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  href={profileHref}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <UserRoundCog className="size-4" />
                  Profile
                </Link>
                <Link
                  href={settingsHref}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(null)
                    onLogout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function notificationRoute(path: string) {
  const legacy: Record<string, string> = {
    '/vet/appointments': '/vet-dashboard',
    '/vet/reviews': '/vet-dashboard/reviews',
    '/vet/subscription': '/vet-dashboard/subscription',
    '/vet/featured-listing': '/vet-dashboard/featured-listing',
    '/vet/practice': '/vet-dashboard/practice-profile',
    '/dashboard/appointments': '/appointment-history',
    '/dashboard/reviews': '/my-reviews',
  }
  return legacy[path] ?? (path.startsWith('/') ? path : '/')
}
