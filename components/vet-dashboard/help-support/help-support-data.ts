import { Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react'

export type VetFaq = {
  question: string
  answer: string
}

export type VetSupportContact = {
  icon: LucideIcon
  value: string
  hint: string
}

export const vetFaqs: VetFaq[] = [
  {
    question: 'How do I update my public practice listing?',
    answer:
      'Use the profile, practice information, services, facilities and gallery pages to keep your listing up to date.',
  },
  {
    question: 'How do I respond to owner reviews?',
    answer:
      'Open the Reviews page, select the review you want to answer, then use the reply action beside the review.',
  },
  {
    question: 'Can I hide a service without deleting pricing?',
    answer:
      'Yes. Turn the service toggle off and it will be hidden from owners while your saved pricing stays available.',
  },
  {
    question: 'Where do new owner enquiries appear?',
    answer:
      'Recent enquiries appear on your dashboard and full enquiry history is available from the Enquiries page.',
  },
]

export const vetSupportContacts: VetSupportContact[] = [
  {
    icon: Mail,
    value: 'support@myvet.co.uk',
    hint: 'We reply within one working day',
  },
  {
    icon: Phone,
    value: '0800 118 2200',
    hint: 'Mon-Fri, 9am-6pm',
  },
  {
    icon: MessageCircle,
    value: 'Start a conversation',
    hint: 'Typically replies in a few minutes',
  },
]
