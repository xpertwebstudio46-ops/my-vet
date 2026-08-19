'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ContactRow } from './contact-row'
import { ContactTabs } from './contact-tabs'
import type { ContactEnquiry, ContactStatus, ContactTab } from './contact-types'

const initialEnquiries: ContactEnquiry[] = [
  {
    id: 'contact-1',
    name: 'Ava Thompson',
    status: 'New',
    subject: 'Question about emergency practices',
    message: 'I need help finding a vet that supports same-day emergency bookings near Oxford.',
    tagLine: 'Received from contact form · ava.thompson@example.com',
  },
  {
    id: 'contact-2',
    name: 'Noah Williams',
    status: 'Archived',
    subject: 'Directory listing correction',
    message: 'The opening hours for one practice appear outdated and need admin review.',
    tagLine: 'Archived after internal review · Bicester',
  },
  {
    id: 'contact-3',
    name: 'Sophia Martinez',
    status: 'Replied',
    subject: 'Sponsorship information',
    message: 'Our company wants to understand available sponsorship placements on MY VET.',
    tagLine: 'Reply sent by admin · Aug 18, 2026',
  },
  {
    id: 'contact-4',
    name: 'Liam Johnson',
    status: 'New',
    subject: 'Account access support',
    message: 'I created an account but cannot see my saved practices in the dashboard.',
    tagLine: 'Needs support follow-up · Reading',
  },
]

export function ContactEnquiriesPage() {
  const [activeTab, setActiveTab] = useState<ContactTab>('New')
  const [enquiries, setEnquiries] = useState(initialEnquiries)

  const counts = useMemo<Record<ContactTab, number>>(() => {
    const statusCounts = enquiries.reduce(
      (current, enquiry) => {
        current[enquiry.status] += 1
        return current
      },
      { New: 0, Archived: 0, Replied: 0 } as Record<ContactStatus, number>,
    )

    return {
      New: statusCounts.New,
      Archived: statusCounts.Archived,
      Replied: statusCounts.Replied,
      All: enquiries.length,
    }
  }, [enquiries])

  const visibleEnquiries =
    activeTab === 'All'
      ? enquiries
      : enquiries.filter((enquiry) => enquiry.status === activeTab)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Contact Enquiries"
        description="Review contact form requests, replies and archived enquiries."
      />

      <Card className="overflow-hidden p-0">
        <ContactTabs
          active={activeTab}
          counts={counts}
          onChange={setActiveTab}
        />
        <div>
          {visibleEnquiries.map((enquiry) => (
            <ContactRow
              key={enquiry.id}
              enquiry={enquiry}
              onReply={() =>
                setEnquiries((current) =>
                  current.map((item) =>
                    item.id === enquiry.id
                      ? { ...item, status: 'Replied' }
                      : item,
                  ),
                )
              }
              onArchive={() =>
                setEnquiries((current) =>
                  current.map((item) =>
                    item.id === enquiry.id
                      ? { ...item, status: 'Archived' }
                      : item,
                  ),
                )
              }
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
