import {
  CalendarClock,
  Clock,
  Edit3,
  Eye,
  ImagePlus,
  MessageSquareReply,
  Star,
  type LucideIcon,
} from 'lucide-react'

export type VetStat = {
  label: string
  value: string
  icon: LucideIcon
}

export type VetEnquiry = {
  id: string
  name: string
  petReference: string
  status: 'New' | 'Replied'
  subject: string
  body: string
  time: string
}

export type CompletionItem = {
  label: string
  done: boolean
}

export type QuickAction = {
  label: string
  icon: LucideIcon
}

export const vetStats: VetStat[] = [
  { label: 'Total profile views', value: '18,420', icon: Eye },
  { label: 'Total reviews', value: '186', icon: MessageSquareReply },
  { label: 'Average rating', value: '4.8', icon: Star },
  { label: 'Subscription left', value: '22 days', icon: Clock },
]

export const recentEnquiries: VetEnquiry[] = [
  {
    id: 'enquiry-1',
    name: 'Ava Thompson',
    petReference: 'Question about pets - Mochi (Cat)',
    status: 'New',
    subject: 'Dental cleaning availability',
    body: 'Can I book a dental check for this week? Mochi has been eating slowly.',
    time: '1 hr ago',
  },
  {
    id: 'enquiry-2',
    name: 'Noah Williams',
    petReference: 'Vaccination support - Bruno (Dog)',
    status: 'Replied',
    subject: 'Booster appointment request',
    body: 'Bruno needs a booster vaccine reminder and preferred afternoon slots.',
    time: '3 hrs ago',
  },
  {
    id: 'enquiry-3',
    name: 'Sophia Martinez',
    petReference: 'Follow-up care - Clover (Rabbit)',
    status: 'New',
    subject: 'Aftercare question',
    body: 'Clover is recovering well, but I want to confirm the feeding notes.',
    time: '6 hrs ago',
  },
]

export const completionItems: CompletionItem[] = [
  { label: 'Practice details completed', done: true },
  { label: 'Services and animal types added', done: true },
  { label: 'Gallery photos uploaded', done: true },
  { label: 'Opening hours verified', done: true },
  { label: 'RCVS certificate uploaded', done: false },
  { label: 'Team profile photos added', done: false },
]

export const quickActions: QuickAction[] = [
  { label: 'Edit practice profile', icon: Edit3 },
  { label: 'Upload gallery photos', icon: ImagePlus },
  { label: 'Update opening hours', icon: CalendarClock },
  { label: 'Reply to review', icon: MessageSquareReply },
]
