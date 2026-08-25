'use client'

import { DashboardHeader } from './dashboard-header'

export function Header({ onOpenSidebar, onLogout }: { onOpenSidebar: () => void; onLogout: () => void }) {
  return <DashboardHeader onOpenSidebar={onOpenSidebar} onLogout={onLogout} searchAction="/find-a-vet" searchPlaceholder="Search MY VET..." notificationsHref="/notifications" profileHref="/my-profile" settingsHref="/account-setting" roleLabel="Pet owner" />
}
