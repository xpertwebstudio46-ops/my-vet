'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRoundCog,
} from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { UserAvatar } from '@/components/dashboard/user-avatar'

const vetNotifications = [
  {
    id: 'vet-note-1',
    title: 'New enquiry from Ava Thompson',
    body: 'Dental cleaning availability for Mochi.',
    time: '1 hr ago',
  },
  {
    id: 'vet-note-2',
    title: 'Review reply pending',
    body: 'A new 5-star review is waiting for your response.',
    time: '3 hrs ago',
  },
  {
    id: 'vet-note-3',
    title: 'Profile completion reminder',
    body: 'Upload RCVS certificate to complete your profile.',
    time: 'Yesterday',
  },
]

type VetHeaderProps = {
  onOpenSidebar: () => void
  onLogout: () => void
}

export function VetHeader({ onOpenSidebar, onLogout }: VetHeaderProps) {
  const [openMenu, setOpenMenu] = useState<'none' | 'notifications' | 'profile'>(
    'none',
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

      <form className="relative max-w-4xl flex-1" action="/vet-dashboard">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="Search enquiries, reviews, profile tasks..."
          className="h-10 w-full rounded-xl border border-white bg-white pl-9 pr-4 text-sm shadow-md shadow-black/10 outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div ref={containerRef} className="ml-auto flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((menu) =>
                menu === 'notifications' ? 'none' : 'notifications',
              )
            }
            className="relative flex size-10 items-center justify-center rounded-full bg-white text-muted-foreground shadow-md shadow-black/10 transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-brand-foreground">
              {vetNotifications.length}
            </span>
          </button>

          {openMenu === 'notifications' && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="dashboard-heading text-base font-normal text-primary">
                  Notifications
                </p>
                <span className="text-xs font-medium text-brand">Recent</span>
              </div>
              <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                {vetNotifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-3">
                    <p className="truncate text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                      {notification.time}
                    </p>
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
              setOpenMenu((menu) => (menu === 'profile' ? 'none' : 'profile'))
            }
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted"
          >
            <UserAvatar name="Dr Maya Collins" className="size-8" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">Dr Maya Collins</span>
              <span className="block text-[0.7rem] text-muted-foreground">
                Practice owner
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>

          {openMenu === 'profile' && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <UserAvatar name="Dr Maya Collins" className="size-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Green Paws Veterinary
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    practice@myvet.co.uk
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <UserRoundCog className="size-4 text-muted-foreground" />
                  Practice profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu('none')
                    onLogout()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
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

export function VetLogoutModal({
  open,
  onClose,
  onLogout,
}: {
  open: boolean
  onClose: () => void
  onLogout: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log out of MY VET?"
      description="You will need to sign in again to manage your practice dashboard."
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
        >
          Stay signed in
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Log out
        </button>
      </div>
    </Modal>
  )
}
