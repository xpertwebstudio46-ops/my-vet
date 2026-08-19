import {
  Bell,
  BarChart3,
  Building2,
  ClipboardCheck,
  CreditCard,
  Crown,
  Handshake,
  Home,
  LogOut,
  Mail,
  MessageSquare,
  PawPrint,
  Settings,
  Stethoscope,
  Users,
  type LucideIcon,
  BluetoothSearchingIcon,
} from 'lucide-react'

export type AdminNavItem = {
  label: string
  href?: string
  action?: 'logout'
  icon: LucideIcon
}

export const adminNavSections: Array<{
  heading?: string
  items: AdminNavItem[]
}> = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin-dashboard/dashboard', icon: Home },
        {
          label: 'Report & analytics',
          href: '/admin-dashboard/report-and-analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      heading: 'Directory',
      items: [
        {
          label: 'Veterinary Practice',
          href: '/admin-dashboard/veterinary-practice',
          icon: Building2,
        },
        {
          label: 'Pending Approvals',
          href: '/admin-dashboard/pending-approvals',
          icon: ClipboardCheck,
        },
        { label: 'Pet Owner', href: '/admin-dashboard/pet-owner', icon: Users },
        {
          label: 'Review Management',
          href: '/admin-dashboard/review-management',
          icon: MessageSquare,
        },
        {
          label: 'Animal Type',
          href: '/admin-dashboard/animal-type',
          icon: PawPrint,
        },
        {
          label: 'Services Management',
          href: '/admin-dashboard/services-management',
          icon: Stethoscope,
        },

      ],
    },
    {
      heading: 'Revenue',
      items: [
        {
          label: 'Featured Listings',
          href: '/admin-dashboard/featured-listings',
          icon: Crown,
        },
        {
          label: 'Sponsorship',
          href: '/admin-dashboard/sponsorship-management',
          icon: Handshake,
        },
        {
          label: 'Subscription Plan',
          href: '/admin-dashboard/subscription-plan',
          icon: CreditCard,
        },
      ],
    },
    {
      heading: 'content',
      items: [
        {
          label: 'Blog Management',
          href: '/admin-dashboard/blog-management',
          icon: BluetoothSearchingIcon,
        },
        {
          label: 'Contact Enquiries',
          href: '/admin-dashboard/contact-enquiries',
          icon: Mail,
        },
        {
          label: 'Notifications',
          href: '/admin-dashboard/notifications',
          icon: Bell,
        },
        {
          label: 'Settings',
          href: '/admin-dashboard/settings',
          icon: Settings,
        },
        { label: 'Logout', action: 'logout', icon: LogOut },
      ],
    }
  ]
