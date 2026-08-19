import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Bebas_Neue, Inter, Outfit } from 'next/font/google'

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

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${dashboardSans.variable} ${dashboardHeading.variable} ${dashboardOutfit.variable}`}
    >
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
