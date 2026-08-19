'use client'

import { useState } from 'react'
import { VetHeader, VetLogoutModal } from './vet-header'
import { VetSidebar } from './vet-sidebar'

export function VetDashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <div className="dashboard-font flex min-h-screen bg-[#F5F6FB]">
      <VetSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={() => {
          setMobileNavOpen(false)
          setLogoutOpen(true)
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <VetHeader
          onOpenSidebar={() => setMobileNavOpen(true)}
          onLogout={() => setLogoutOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="w-full">{children}</div>
        </main>
      </div>

      <VetLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  )
}
