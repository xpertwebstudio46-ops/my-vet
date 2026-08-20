'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export function AdminHeader({ onOpenSidebar, onLogout }: { onOpenSidebar: () => void; onLogout: () => void }) {
  return <DashboardHeader onOpenSidebar={onOpenSidebar} onLogout={onLogout} searchAction="/admin-dashboard/veterinary-practice" searchPlaceholder="Search practices..." notificationsHref="/admin-dashboard/notifications" profileHref="/admin-dashboard/settings" settingsHref="/admin-dashboard/settings" roleLabel="Administrator" />
}
