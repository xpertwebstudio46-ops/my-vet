'use client'

import { useEffect, useState } from 'react'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'
import { Card } from '@/components/dashboard/ui'
import { ConfirmDeleteModal } from './confirm-delete-modal'
import { TeamMemberCard } from './team-member-card'
import { TeamMemberFormModal } from './team-member-form-modal'
import { TeamMembersBanner } from './team-members-banner'
import type { TeamMember, TeamMemberInput } from './team-member-types'

export function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState<TeamMember | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient<TeamMember[]>('/api/vet/team-members')
      .then(setMembers)
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Team members could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  async function saveMember(input: TeamMemberInput) {
    setError('')
    const asset = input.file ? await uploadImage(input.file, 'TEAM_MEMBER') : null
    try {
      const body = { name: input.name, role: input.role, bio: input.bio, qualifications: input.qualifications, active: input.active, sortOrder: input.sortOrder }
      const member = await apiClient<TeamMember>(editing ? `/api/vet/team-members/${editing.id}` : '/api/vet/team-members', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...body, ...(asset ? { imageAssetId: asset.id } : {}) }),
      })
      setMembers((current) => editing ? current.map((item) => (item.id === member.id ? member : item)) : [...current, member])
    } catch (caught) {
      if (asset) await discardUpload(asset)
      throw caught
    }
    setEditing(null)
    setModalOpen(false)
  }

  async function deleteMember(member: TeamMember) {
    try {
      await apiClient(`/api/vet/team-members/${member.id}`, { method: 'DELETE' })
      setMembers((current) => current.filter((item) => item.id !== member.id))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Team member could not be deleted.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <TeamMembersBanner
        onAdd={() => {
          setEditing(null)
          setModalOpen(true)
        }}
      />

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-muted-foreground">Loading team membersâ€¦</p>}
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={() => {
                setEditing(member)
                setModalOpen(true)
              }}
              onDelete={() => setDeleting(member)}
            />
          ))}
        </div>
      </Card>

      {modalOpen && (
        <TeamMemberFormModal
          member={editing}
          onClose={() => {
            setEditing(null)
            setModalOpen(false)
          }}
          onSave={saveMember}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          title="Delete team member?"
          description={`This will remove ${deleting.name} from your team members.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => void deleteMember(deleting)}
        />
      )}
    </div>
  )
}
