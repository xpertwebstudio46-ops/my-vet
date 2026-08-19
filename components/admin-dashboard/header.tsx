'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'

const adminUser = {
  fullName: 'Admin User',
  firstName: 'Admin',
  email: 'admin@myvet.com',
}

const adminNotifications = [
  {
    id: 'approval-1',
    title: 'Practice approval waiting',
    body: 'Green Paws Veterinary submitted updated documents.',
    time: '12 min ago',
    unread: true,
  },
  {
    id: 'review-1',
    title: 'Review needs attention',
    body: 'A flagged review was added for CityVet Clinic.',
    time: '32 min ago',
    unread: true,
  },
  {
    id: 'owner-1',
    title: 'New pet owner signup',
    body: 'A new account was created in Austin, TX.',
    time: '1 hr ago',
    unread: false,
  },
]

type AdminHeaderProps = {
  onOpenSidebar: () => void
  onLogout: () => void
}

export function AdminHeader({ onOpenSidebar, onLogout }: AdminHeaderProps) {
  const [openMenu, setOpenMenu] = useState<'none' | 'notifications' | 'profile'>(
    'none',
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const unread = adminNotifications.filter((n) => n.unread).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenMenu('none')
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/5 bg-[#F5F6FB]/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <form className="relative flex-1 max-w-4xl" action="/admin-dashboard/dashboard">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="Search practices, owners, reviews..."
          className="h-10 w-full rounded-xl border border-white bg-white pl-9 pr-4 text-sm shadow-md shadow-black/10 outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div ref={containerRef} className="ml-auto flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((m) =>
                m === 'notifications' ? 'none' : 'notifications',
              )
            }
            className="relative flex size-10 items-center justify-center rounded-full bg-white text-muted-foreground shadow-md shadow-black/10 transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-brand-foreground">
                {unread}
              </span>
            )}
          </button>

          {openMenu === 'notifications' && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="dashboard-outfit text-base font-semibold text-primary">
                  Notifications
                </p>
                <Link
                  href="/admin-dashboard/notifications"
                  onClick={() => setOpenMenu('none')}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                {adminNotifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href="/admin-dashboard/notifications"
                      onClick={() => setOpenMenu('none')}
                      className="flex gap-3 px-4 py-3 hover:bg-muted"
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          notification.unread ? 'bg-brand' : 'bg-transparent'
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {notification.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {notification.body}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                          {notification.time}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((m) => (m === 'profile' ? 'none' : 'profile'))
            }
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted"
          >
            <UserAvatar name={adminUser.fullName} className="size-8" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">
                {adminUser.firstName}
              </span>
              <span className="block text-[0.7rem] text-muted-foreground">
                Admin
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>

          {openMenu === 'profile' && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <UserAvatar name={adminUser.fullName} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {adminUser.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {adminUser.email}
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href="/admin-dashboard/profile"
                  onClick={() => setOpenMenu('none')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="size-4 text-muted-foreground" /> Profile
                </Link>
                <Link
                  href="/admin-dashboard/settings"
                  onClick={() => setOpenMenu('none')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  Settings
                </Link>
                <Link
                  href="/admin-dashboard/approvals"
                  onClick={() => setOpenMenu('none')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Shield className="size-4 text-muted-foreground" />
                  Review approvals
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu('none')
                    onLogout()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
