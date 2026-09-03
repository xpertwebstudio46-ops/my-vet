import {
  Bell,
  Bookmark,
  CalendarDays,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  PawPrint,
  Search,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react'

export type DashboardNavItem = {
  label: string
  href?: string
  action?: 'logout'
  icon: LucideIcon
}

export const navSections: Array<{
  heading?: string
  items: DashboardNavItem[]
}> = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
      { label: 'Find a Vet', href: '/find-a-vet', icon: Search },
      {
        label: 'Appointments',
        href: '/appointment-history',
        icon: CalendarDays,
      },
    ],
  },
  {
    heading: 'My Vets',
    items: [
      {
        label: 'Favourite vets',
        href: '/favourite-vets',
        icon: PawPrint,
      },
      {
        label: 'Saved practices',
        href: '/saved-practice',
        icon: Bookmark,
      },
      { label: 'My reviews', href: '/my-reviews', icon: MessageSquare },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'My profile', href: '/my-profile', icon: User },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      {
        label: 'Account settings',
        href: '/account-setting',
        icon: Settings,
      },
      { label: 'Help & support', href: '/help-support', icon: HelpCircle },
      { label: 'Logout', action: 'logout', icon: LogOut },
    ],
  },
]
