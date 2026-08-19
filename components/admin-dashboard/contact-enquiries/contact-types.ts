export type ContactStatus = 'New' | 'Archived' | 'Replied'

export type ContactTab = ContactStatus | 'All'

export type ContactEnquiry = {
  id: string
  name: string
  status: ContactStatus
  subject: string
  message: string
  tagLine: string
}
