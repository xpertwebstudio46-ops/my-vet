'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/dashboard/modal'
import { AdminHeader } from './header'
import { AdminSidebar } from './sidebar'

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return

    previousPathname.current = pathname

    const showTimer = window.setTimeout(() => {
      setRouteLoading(true)
    }, 0)
    const hideTimer = window.setTimeout(() => {
      setRouteLoading(false)
    }, 420)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [pathname])

  return (
    <div className="dashboard-font flex min-h-screen bg-[#F5F6FB]">
      <AdminSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={() => {
          setMobileNavOpen(false)
          setLogoutOpen(true)
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          onOpenSidebar={() => setMobileNavOpen(true)}
          onLogout={() => setLogoutOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="w-full">
            {routeLoading ? <AdminDashboardSkeleton /> : children}
          </div>
        </main>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of MY VET?"
        description="You will need to sign in again to manage practices, reviews and approvals."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLogoutOpen(false)}
          >
            Stay signed in
          </Button>
          <Button
            size="lg"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => setLogoutOpen(false)}
          >
            Log out
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="rounded-2xl bg-white p-5 shadow-lg shadow-black/10">
        <SkeletonBlock className="h-11 w-72 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10"
          >
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-4 h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <SkeletonBlock className="h-80 rounded-2xl" />
        <SkeletonBlock className="h-80 rounded-2xl" />
      </div>
      <SkeletonBlock className="h-96 rounded-2xl" />
    </div>
  )
}
