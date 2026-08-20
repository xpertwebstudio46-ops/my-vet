'use client'

import { Modal } from '@/components/dashboard/modal'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export function VetHeader({ onOpenSidebar, onLogout }: { onOpenSidebar: () => void; onLogout: () => void }) {
  return <DashboardHeader onOpenSidebar={onOpenSidebar} onLogout={onLogout} searchAction="/vet-dashboard" searchPlaceholder="Search appointments and practice tasks..." notificationsHref="/vet-dashboard/notifications" profileHref="/vet-dashboard/practice-profile" settingsHref="/vet-dashboard/settings" roleLabel="Practice owner" />
}

export function VetLogoutModal({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return <Modal open={open} onClose={onClose} title="Log out of MY VET?" description="You will need to sign in again to manage your practice dashboard."><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Stay signed in</button><button type="button" onClick={onLogout} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">Log out</button></div></Modal>
}
