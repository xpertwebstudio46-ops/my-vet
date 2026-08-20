import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import type { TeamMember } from './team-member-types'

export function TeamMemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="flex items-start gap-4">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={member.imageUrl || '/placeholder.svg'}
            alt={member.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-black">
            {member.name}
          </h2>
          <p className="mt-1 w-fit rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">
            {member.role}
          </p>
          <div className="mt-3 space-y-1 text-sm leading-5">
            <p className="flex flex-wrap gap-x-2">
              <span className="font-semibold text-[#01AEAD]">Qualifications</span>
              <span className="text-slate-500">{member.qualifications || 'Not listed'}</span>
            </p>
            <p className="flex flex-wrap gap-x-2">
              <span className="font-semibold text-[#01AEAD]">Bio</span>
              <span className="line-clamp-2 text-slate-500">{member.bio || 'No bio added'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-start gap-2 border-t border-gray-200/80 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-3 text-sm font-semibold text-black hover:bg-slate-50"
        >
          <Pencil className="size-4 text-slate-400" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-transparent px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>
    </div>
  )
}
