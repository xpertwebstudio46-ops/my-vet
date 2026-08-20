'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import { SponsorCard } from './sponsor-card'
import { SponsorFormModal } from './sponsor-form-modal'
import type { Sponsor, SponsorInput } from './sponsor-types'

export function SponsorshipManagementPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient<Sponsor[]>('/api/admin/sponsorships').then(setSponsors).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Sponsors could not be loaded.')).finally(() => setLoading(false))
  }, [])

  async function saveSponsor(input: SponsorInput) {
    setError('')
    const asset = input.file ? await uploadImage(input.file, 'SPONSORSHIP') : null
    try {
      const body = { name: input.name, description: input.description, websiteUrl: input.websiteUrl, startsAt: input.startsAt, endsAt: input.endsAt, active: input.active, sortOrder: input.sortOrder }
      const sponsor = await apiClient<Sponsor>(editing ? `/api/admin/sponsorships/${editing.id}` : '/api/admin/sponsorships', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...body, ...(asset ? { imageAssetId: asset.id } : {}) }),
      })
      setSponsors((current) => editing ? current.map((item) => item.id === sponsor.id ? sponsor : item) : [...current, sponsor])
    } catch (caught) {
      if (asset) await discardUpload(asset)
      throw caught
    }
    setEditing(null)
    setModalOpen(false)
  }

  async function deleteSponsor(sponsor: Sponsor) {
    try {
      await apiClient(`/api/admin/sponsorships/${sponsor.id}`, { method: 'DELETE' })
      setSponsors((current) => current.filter((item) => item.id !== sponsor.id))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Sponsor could not be removed.')
    } finally {
      setDeletingSponsor(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Sponsorship Management" description="Create and manage sponsor placements across the platform." action={{ label: 'Add Sponsor', icon: 'plus', tone: 'blue', onClick: () => { setEditing(null); setModalOpen(true) } }} />
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {loading && <p className="text-sm text-muted-foreground">Loading sponsors...</p>}
          {sponsors.map((sponsor) => <SponsorCard key={sponsor.id} sponsor={sponsor} onEdit={() => { setEditing(sponsor); setModalOpen(true) }} onRemove={() => setDeletingSponsor(sponsor)} />)}
        </div>
      </Card>
      {modalOpen && <SponsorFormModal sponsor={editing} onClose={() => { setEditing(null); setModalOpen(false) }} onSave={saveSponsor} />}
      {deletingSponsor && <ConfirmDeleteModal title="Remove sponsor?" description={`This permanently removes ${deletingSponsor.name} and its R2 image.`} confirmLabel="Remove" onClose={() => setDeletingSponsor(null)} onConfirm={() => void deleteSponsor(deletingSponsor)} />}
    </div>
  )
}
