'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import { SponsorCard } from './sponsor-card'
import { SponsorFormModal } from './sponsor-form-modal'
import type { Sponsor } from './sponsor-types'

const initialSponsors: Sponsor[] = [
  {
    id: 'sponsor-1',
    image: '/images/practice-1.png',
    name: 'PetCare Nutrition',
    planTag: 'Gold sponsor',
    spend: '£4,800',
    contractNo: 'SP-2026-014',
  },
  {
    id: 'sponsor-2',
    image: '/images/practice-2.png',
    name: 'VetShield Insurance',
    planTag: 'Premium sponsor',
    spend: '£7,200',
    contractNo: 'SP-2026-021',
  },
]

export function SponsorshipManagementPage() {
  const [sponsors, setSponsors] = useState(initialSponsors)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null)

  function saveSponsor(sponsor: Sponsor) {
    setSponsors((current) => {
      const exists = current.some((item) => item.id === sponsor.id)
      return exists
        ? current.map((item) => (item.id === sponsor.id ? sponsor : item))
        : [...current, sponsor]
    })
    setEditing(null)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Sponsorship Management"
        description="Create and manage sponsor placements across the platform."
        action={{
          label: 'Add Sponsor',
          icon: 'plus',
          tone: 'blue',
          onClick: () => {
            setEditing(null)
            setModalOpen(true)
          },
        }}
      />

      <Card className="p-5">
        <div className="grid gap-4 grid-cols-2">
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={() => {
                setEditing(sponsor)
                setModalOpen(true)
              }}
              onRemove={() => setDeletingSponsor(sponsor)}
            />
          ))}
        </div>
      </Card>

      {modalOpen && (
        <SponsorFormModal
          sponsor={editing}
          onClose={() => {
            setEditing(null)
            setModalOpen(false)
          }}
          onSave={saveSponsor}
        />
      )}

      {deletingSponsor && (
        <ConfirmDeleteModal
          title="Remove sponsor?"
          description={`This will remove ${deletingSponsor.name} from sponsorship management.`}
          confirmLabel="Remove"
          onClose={() => setDeletingSponsor(null)}
          onConfirm={() => {
            setSponsors((current) =>
              current.filter((item) => item.id !== deletingSponsor.id),
            )
            setDeletingSponsor(null)
          }}
        />
      )}
    </div>
  )
}
