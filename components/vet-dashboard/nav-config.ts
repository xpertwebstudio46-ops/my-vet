import {
  Bell,
  BarChart3,
  Building2,
  CalendarClock,
  Camera,
  Cat,
  ClipboardList,
  HelpCircle,
  Home,
  LogOut,
  ReceiptPoundSterling,
  Settings,
  Star,
  Stethoscope,
  UsersRound,
  UserRoundCog,
  type LucideIcon,
} from 'lucide-react'

export type VetNavItem = {
  label: string
  href?: string
  action?: 'logout'
  icon: LucideIcon
}

export const vetNavSections: Array<{
  heading?: string
  items: VetNavItem[]
}> = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/vet-dashboard', icon: Home },
      { label: 'Analytics', href: '/vet-dashboard/analytics', icon: BarChart3 },
      { label: 'Reviews', href: '/vet-dashboard/reviews', icon: Star },
    ],
  },
  {
    heading: 'Practice',
    items: [
      {
        label: 'My profile',
        href: '/vet-dashboard/practice-profile',
        icon: UserRoundCog,
      },
      {
        label: 'Practice information',
        href: '/vet-dashboard/practice-information',
        icon: ClipboardList,
      },
      {
        label: 'Team members',
        href: '/vet-dashboard/team-members',
        icon: UsersRound,
      },
      {
        label: 'Services',
        href: '/vet-dashboard/services',
        icon: Stethoscope,
      },
      {
        label: 'Animal Types',
        href: '/vet-dashboard/animal-type',
        icon: Cat,
      },
      {
        label: 'Facilities',
        href: '/vet-dashboard/facilities',
        icon: Building2,
      },
      {
        label: 'Pricing',
        href: '/vet-dashboard/pricing',
        icon: ReceiptPoundSterling,
      },
      {
        label: 'Opening hours',
        href: '/vet-dashboard/opening-hours',
        icon: CalendarClock,
      },
      {
        label: 'Gallery',
        href: '/vet-dashboard/gallery',
        icon: Camera,
      },
    ],
  },
  
  {
    heading: 'Account',
    items: [
      { label: 'Notifications', href: '/vet-dashboard/notifications', icon: Bell },
      { label: 'Settings', href: '/vet-dashboard/settings', icon: Settings },
      { label: 'Help & support', href: '/vet-dashboard/help-support', icon: HelpCircle },
      { label: 'Logout', action: 'logout', icon: LogOut },
    ],
  },
]
