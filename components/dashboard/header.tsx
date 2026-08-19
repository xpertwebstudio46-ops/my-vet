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
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { currentUser, notifications } from '@/lib/dashboard-data'
import { UserAvatar } from './user-avatar'

type HeaderProps = {
  onOpenSidebar: () => void
  onLogout: () => void
}

export function Header({ onOpenSidebar, onLogout }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<'none' | 'notifications' | 'profile'>(
    'none',
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => n.unread).length

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

      <form
        className="relative flex-1 max-w-4xl"
        action="/find-a-vet"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="Search MY VET..."
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
                <p className="dashboard-heading text-base font-normal text-primary">
                  Notifications
                </p>
                <Link
                  href="/notifications"
                  onClick={() => setOpenMenu('none')}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <Link
                      href="/notifications"
                      onClick={() => setOpenMenu('none')}
                      className="flex gap-3 px-4 py-3 hover:bg-muted"
                    >
                      <span
                        className={cn(
                          'mt-1.5 size-2 shrink-0 rounded-full',
                          n.unread ? 'bg-brand' : 'bg-transparent',
                        )}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {n.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {n.body}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                          {n.time}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border bg-muted/50 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Logged off yet? You will need to sign in again to manage your
                  account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu('none')
                    onLogout()
                  }}
                  className="w-full rounded-lg bg-destructive/10 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
                >
                  Log out
                </button>
              </div>
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
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.fullName}
              className="size-8"
            />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="block text-[0.7rem] text-muted-foreground">
                Pet owner
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>

          {openMenu === 'profile' && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.fullName}
                  className="size-10"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {currentUser.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href="/my-profile"
                  onClick={() => setOpenMenu('none')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="size-4 text-muted-foreground" /> My Profile
                </Link>
                <Link
                  href="/account-setting"
                  onClick={() => setOpenMenu('none')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="size-4 text-muted-foreground" /> Account
                  Settings
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
