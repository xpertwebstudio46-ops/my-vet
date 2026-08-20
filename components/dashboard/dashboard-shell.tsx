'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Header } from './header'
import { Modal } from './modal'
import { Sidebar } from './sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
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
      <Sidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={() => {
          setMobileNavOpen(false)
          setLogoutOpen(true)
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenSidebar={() => setMobileNavOpen(true)}
          onLogout={() => setLogoutOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            {routeLoading ? <DashboardContentSkeleton /> : children}
          </div>
        </main>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of MY VET?"
        description="You will need to sign in again to manage your account, appointments and saved practices."
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
            onClick={() => void logout().then(() => router.replace('/'))}
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

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="rounded-2xl bg-white p-5 shadow-lg shadow-black/10">
        <SkeletonBlock className="h-12 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg shadow-black/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-11" />
          <SkeletonBlock className="h-11" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white bg-white p-4 shadow-lg shadow-black/10"
          >
            <div className="flex gap-4">
              <SkeletonBlock className="h-[72px] w-[72px] shrink-0" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="mt-3 h-3 w-1/2" />
                <SkeletonBlock className="mt-3 h-3 w-2/3" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <SkeletonBlock className="h-7 w-16 rounded-full" />
              <SkeletonBlock className="h-7 w-16 rounded-full" />
              <SkeletonBlock className="h-7 w-20 rounded-full" />
            </div>
            <div className="mt-4 border-t border-gray-200/70 pt-4">
              <div className="flex justify-between gap-3">
                <SkeletonBlock className="h-9 w-28" />
                <SkeletonBlock className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
