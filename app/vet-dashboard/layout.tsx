import { Bebas_Neue, Inter, Outfit } from 'next/font/google'
import { VetDashboardShell } from '@/components/vet-dashboard/vet-dashboard-shell'
import { RequireAuth } from '@/components/auth/RequireAuth'

const dashboardSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dashboard-inter',
})

const dashboardHeading = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-dashboard-bebas',
})

const dashboardOutfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dashboard-outfit',
})

export default function VetDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${dashboardSans.variable} ${dashboardHeading.variable} ${dashboardOutfit.variable}`}
    >
      <RequireAuth roles={['VET']}>
        <VetDashboardShell>{children}</VetDashboardShell>
      </RequireAuth>
    </div>
  )
}
