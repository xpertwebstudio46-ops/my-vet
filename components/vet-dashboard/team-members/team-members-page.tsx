'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { ConfirmDeleteModal } from './confirm-delete-modal'
import { TeamMemberCard } from './team-member-card'
import { TeamMemberFormModal } from './team-member-form-modal'
import { TeamMembersBanner } from './team-members-banner'
import type { TeamMember } from './team-member-types'

const initialMembers: TeamMember[] = [
  {
    id: 'member-1',
    image: '/images/person-1.png',
    name: 'Dr Amelia Carter',
    role: 'Lead veterinary surgeon',
    experience: '12 years',
    focus: 'Soft tissue surgery',
    bio: 'Amelia leads preventive care, diagnostics and complex case follow-up for small animals.',
  },
  {
    id: 'member-2',
    image: '/images/person-2.png',
    name: 'Dr Noah Brooks',
    role: 'Veterinary surgeon',
    experience: '8 years',
    focus: 'Emergency care',
    bio: 'Noah supports urgent appointments, vaccination plans and owner education.',
  },
  {
    id: 'member-3',
    image: '/images/person-3.png',
    name: 'Sophia Lee',
    role: 'Registered veterinary nurse',
    experience: '6 years',
    focus: 'Surgical nursing',
    bio: 'Sophia manages patient comfort, surgical preparation and post-visit care notes.',
  },
]

export function TeamMembersPage() {
  const [members, setMembers] = useState(initialMembers)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState<TeamMember | null>(null)

  function saveMember(member: TeamMember) {
    setMembers((current) => {
      const exists = current.some((item) => item.id === member.id)
      return exists
        ? current.map((item) => (item.id === member.id ? member : item))
        : [...current, member]
    })
    setEditing(null)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <TeamMembersBanner
        onAdd={() => {
          setEditing(null)
          setModalOpen(true)
        }}
      />

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          onConfirm={() => {
            setMembers((current) =>
              current.filter((item) => item.id !== deleting.id),
            )
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
