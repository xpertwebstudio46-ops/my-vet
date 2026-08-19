'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  Ban,
  Check,
  Clock,
  Download,
  FileCheck,
  MapPin,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { Card } from '@/components/dashboard/ui'
import { ConfirmDeleteModal } from './shared/confirm-delete-modal'

type PracticeStatus = 'Active' | 'Pending' | 'Inactive'
type OwnerStatus = 'Active' | 'Inactive'

type PracticeRow = {
  id: string
  image: string
  practice: string
  location: string
  owner: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  planTone: 'blue' | 'gray' | 'teal'
  rating: number
  reviews: number
  joined: string
  status: PracticeStatus
}

type OwnerRow = {
  id: string
  image: string
  user: string
  email: string
  town: string
  pets: number
  reviews: number
  joined: string
  status: OwnerStatus
}

type PendingApproval = {
  id: string
  practice: string
  reviewStatus: string
  contact: string
  doctor: string
  town: string
  registrationNumber: string
  animalTypes: string[]
  submitted: string
}

const initialPractices: PracticeRow[] = [
  {
    id: 'practice-1',
    image: '/images/practice-1.png',
    practice: 'Green Paws Veterinary',
    location: 'Oxford, UK',
    owner: 'Dr. Maya Collins',
    plan: 'Enterprise',
    planTone: 'blue',
    rating: 4.8,
    reviews: 438,
    joined: 'Aug 12, 2026',
    status: 'Active',
  },
  {
    id: 'practice-2',
    image: '/images/practice-2.png',
    practice: 'CityVet Wellness Clinic',
    location: 'Bicester, UK',
    owner: 'Dr. Daniel Brooks',
    plan: 'Professional',
    planTone: 'teal',
    rating: 4.6,
    reviews: 296,
    joined: 'Jul 28, 2026',
    status: 'Pending',
  },
  {
    id: 'practice-3',
    image: '/images/practice-3.png',
    practice: 'Northside Animal Care',
    location: 'Banbury, UK',
    owner: 'Dr. Hannah Lee',
    plan: 'Starter',
    planTone: 'gray',
    rating: 4.2,
    reviews: 118,
    joined: 'Jun 16, 2026',
    status: 'Active',
  },
  {
    id: 'practice-4',
    image: '/images/vet-1.png',
    practice: 'Happy Tails Vet Center',
    location: 'Reading, UK',
    owner: 'Dr. Liam Johnson',
    plan: 'Professional',
    planTone: 'teal',
    rating: 4.4,
    reviews: 87,
    joined: 'May 08, 2026',
    status: 'Inactive',
  },
]

const initialOwners: OwnerRow[] = [
  {
    id: 'owner-1',
    image: '/images/person-1.png',
    user: 'Ava Thompson',
    email: 'ava.thompson@example.com',
    town: 'Oxford',
    pets: 3,
    reviews: 8,
    joined: 'Aug 14, 2026',
    status: 'Active',
  },
  {
    id: 'owner-2',
    image: '/images/person-2.png',
    user: 'Noah Williams',
    email: 'noah.williams@example.com',
    town: 'Bicester',
    pets: 1,
    reviews: 4,
    joined: 'Aug 03, 2026',
    status: 'Inactive',
  },
  {
    id: 'owner-3',
    image: '/images/person-3.png',
    user: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    town: 'Banbury',
    pets: 2,
    reviews: 6,
    joined: 'Jul 21, 2026',
    status: 'Active',
  },
  {
    id: 'owner-4',
    image: '/images/person-4.png',
    user: 'Liam Johnson',
    email: 'liam.johnson@example.com',
    town: 'Reading',
    pets: 4,
    reviews: 12,
    joined: 'Jun 30, 2026',
    status: 'Active',
  },
]

const initialApprovals: PendingApproval[] = [
  {
    id: 'approval-1',
    practice: 'Willow Farm Veterinary',
    reviewStatus: 'Documents under review',
    contact: 'hello@willowfarmvet.co.uk',
    doctor: 'Dr. John Doe',
    town: 'Bicester',
    registrationNumber: 'RCVS-48291',
    animalTypes: ['Farm animal', 'Normal animal', 'Horses'],
    submitted: '2 hrs ago',
  },
  {
    id: 'approval-2',
    practice: 'Cherwell Small Animal Vets',
    reviewStatus: 'License check pending',
    contact: 'admin@cherwellvets.co.uk',
    doctor: 'Dr. Emma Clark',
    town: 'Oxford',
    registrationNumber: 'RCVS-58302',
    animalTypes: ['Normal animal'],
    submitted: '4 hrs ago',
  },
  {
    id: 'approval-3',
    practice: 'Oakridge Equine Care',
    reviewStatus: 'Certificate uploaded',
    contact: 'care@oakridgeequine.co.uk',
    doctor: 'Dr. Oliver Smith',
    town: 'Reading',
    registrationNumber: 'RCVS-69014',
    animalTypes: ['Horses'],
    submitted: '6 hrs ago',
  },
  {
    id: 'approval-4',
    practice: 'Meadowbrook Animal Hospital',
    reviewStatus: 'Waiting for admin review',
    contact: 'support@meadowbrook.co.uk',
    doctor: 'Dr. Amelia Brown',
    town: 'Banbury',
    registrationNumber: 'RCVS-73490',
    animalTypes: ['Farm animal', 'Normal animal'],
    submitted: '8 hrs ago',
  },
  {
    id: 'approval-5',
    practice: 'Summertown Vet Care',
    reviewStatus: 'Profile photos approved',
    contact: 'team@summertownvet.co.uk',
    doctor: 'Dr. Ethan Wilson',
    town: 'Summertown',
    registrationNumber: 'RCVS-81245',
    animalTypes: ['Normal animal', 'Horses'],
    submitted: '12 hrs ago',
  },
]

export function ManageVeterinaryPracticePage() {
  const [query, setQuery] = useState('')
  const [practices, setPractices] = useState(initialPractices)
  const [editing, setEditing] = useState<PracticeRow | null>(null)
  const [deletingPractice, setDeletingPractice] = useState<PracticeRow | null>(
    null,
  )

  const filteredPractices = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return practices

    return practices.filter((practice) =>
      [
        practice.practice,
        practice.location,
        practice.owner,
        practice.plan,
        practice.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [practices, query])

  function savePractice(updated: PracticeRow) {
    setPractices((current) =>
      current.map((practice) =>
        practice.id === updated.id ? updated : practice,
      ),
    )
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Manage Veterinary Practice"
        description="Manage listed veterinary practices, subscription plans and directory status."
      />

      <Card className="overflow-hidden p-0">
        <SearchPanel
          value={query}
          onChange={setQuery}
          placeholder="Search by practice, owner, location, plan or status"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b text-xs font-semibold dashboard-font text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Practice</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPractices.map((practice, index) => (
                <tr
                  key={practice.id}
                  className={
                    index === filteredPractices.length - 1
                      ? ''
                      : 'border-b border-gray-200/80'
                  }
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={practice.image}
                          alt={practice.practice}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate dashboard-inter text-[14px] font-medium text-black">
                          {practice.practice}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {practice.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[14px] dashboard-font font-normal text-black/70">
                    {practice.owner}
                  </td>
                  <td className="px-5 py-4">
                    <PlanBadge tone={practice.planTone}>{practice.plan}</PlanBadge>
                  </td>
                  <td className="px-5 py-4">
                    <Rating value={practice.rating} count={practice.reviews} />
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {practice.joined}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={practice.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label="Edit practice"
                        onClick={() => setEditing(practice)}
                      >
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Delete practice"
                        tone="danger"
                        onClick={() => setDeletingPractice(practice)}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Disable practice"
                        onClick={() =>
                          setPractices((current) =>
                            current.map((item) =>
                              item.id === practice.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === 'Inactive'
                                        ? 'Active'
                                        : 'Inactive',
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <Ban className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PracticeEditModal
        practice={editing}
        onClose={() => setEditing(null)}
        onSave={savePractice}
      />

      {deletingPractice && (
        <ConfirmDeleteModal
          title="Delete practice?"
          description={`This will remove ${deletingPractice.practice} from the practices table.`}
          onClose={() => setDeletingPractice(null)}
          onConfirm={() => {
            setPractices((current) =>
              current.filter((item) => item.id !== deletingPractice.id),
            )
            setDeletingPractice(null)
          }}
        />
      )}
    </div>
  )
}

export function PendingApprovalsPage() {
  const [approvals, setApprovals] = useState(initialApprovals)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Pending Approvals"
        description="Review new veterinary practice submissions before they appear in the directory."
      />

      <div className="grid gap-4">
        {approvals.map((approval) => (
          <Card key={approval.id} className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <div className="border-b border-gray-200/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="dashboard-outfit text-[15px] font-semibold text-black">
                      {approval.practice}
                    </h2>
                    <span className="w-fit shrink-0 rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">
                      {approval.reviewStatus}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <ApprovalField label="Contact" value={approval.contact} />
                  <ApprovalField label="Doctor" value={approval.doctor} />
                  <ApprovalField label="Town" value={approval.town} />
                  <ApprovalField
                    label="Registration number"
                    value={approval.registrationNumber}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-gray-200/80 px-5 py-4">
                  {approval.animalTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#064071]"
                    >
                      {type}
                    </span>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-semibold text-[#01AEAD] hover:underline"
                  >
                    <FileCheck className="size-4" />
                    View RCVS certificate
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 border-t border-gray-200/80 bg-white p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                  <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    Submitted
                  </p>
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#064071]">
                    <Clock className="size-4 text-[#01AEAD]" />
                    {approval.submitted}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-500 bg-transparent px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                    onClick={() =>
                      setApprovals((current) =>
                        current.filter((item) => item.id !== approval.id),
                      )
                    }
                  >
                    <X className="size-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
                    onClick={() =>
                      setApprovals((current) =>
                        current.filter((item) => item.id !== approval.id),
                      )
                    }
                  >
                    <Check className="size-4" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function PetOwnerPage() {
  const [query, setQuery] = useState('')
  const [owners, setOwners] = useState(initialOwners)
  const [editing, setEditing] = useState<OwnerRow | null>(null)
  const [deletingOwner, setDeletingOwner] = useState<OwnerRow | null>(null)

  const filteredOwners = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return owners

    return owners.filter((owner) =>
      [owner.user, owner.email, owner.town, owner.status]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [owners, query])

  function saveOwner(updated: OwnerRow) {
    setOwners((current) =>
      current.map((owner) => (owner.id === updated.id ? updated : owner)),
    )
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Pet Owner"
        description="Manage pet owner accounts, activity and account status."
      />

      <Card className="overflow-hidden p-0">
        <SearchPanel
          value={query}
          onChange={setQuery}
          placeholder="Search by user, email, town or status"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Town</th>
                <th className="px-5 py-4">Pets</th>
                <th className="px-5 py-4">Reviews</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((owner, index) => (
                <tr
                  key={owner.id}
                  className={
                    index === filteredOwners.length - 1
                      ? ''
                      : 'border-b border-gray-200/80'
                  }
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={owner.image}
                          alt={owner.user}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                          {owner.user}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {owner.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {owner.town}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {owner.pets}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {owner.reviews}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {owner.joined}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={owner.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label="Edit pet owner"
                        onClick={() => setEditing(owner)}
                      >
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Delete pet owner"
                        tone="danger"
                        onClick={() => setDeletingOwner(owner)}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Disable pet owner"
                        onClick={() =>
                          setOwners((current) =>
                            current.map((item) =>
                              item.id === owner.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === 'Inactive'
                                        ? 'Active'
                                        : 'Inactive',
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <Ban className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <OwnerEditModal
        owner={editing}
        onClose={() => setEditing(null)}
        onSave={saveOwner}
      />

      {deletingOwner && (
        <ConfirmDeleteModal
          title="Delete pet owner?"
          description={`This will remove ${deletingOwner.user} from the pet owner table.`}
          onClose={() => setDeletingOwner(null)}
          onConfirm={() => {
            setOwners((current) =>
              current.filter((item) => item.id !== deletingOwner.id),
            )
            setDeletingOwner(null)
          }}
        />
      )}
    </div>
  )
}

function AdminPageBanner({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          {title}
        </h1>
        <p className="dashboard-font mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#064071] bg-transparent px-4 text-sm font-semibold text-[#064071] transition-colors hover:bg-[#064071] hover:text-white"
      >
        <Download className="size-4" />
        Export CSV
      </button>
    </section>
  )
}

function SearchPanel({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="border-b border-gray-200/80 p-4">
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
        />
      </div>
    </div>
  )
}

function Rating({ value, count }: { value: number; count: number }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-warning">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${
              index < Math.round(value)
                ? 'fill-warning text-warning'
                : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs font-semibold dashboard-font text-[#425350]">
        {value.toFixed(1)} ({count})
      </p>
    </div>
  )
}

function PlanBadge({
  tone,
  children,
}: {
  tone: PracticeRow['planTone']
  children: React.ReactNode
}) {
  const styles: Record<PracticeRow['planTone'], string> = {
    blue: 'bg-[#064071] text-white',
    gray: 'bg-slate-100 text-slate-700',
    teal: 'bg-[#EEF7F5] text-[#01AEAD]',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  )
}

function StatusBadge({ status }: { status: PracticeStatus | OwnerStatus }) {
  const styles: Record<PracticeStatus | OwnerStatus, string> = {
    Active: 'bg-[#EEF7F5] text-[#01AEAD]',
    Pending: 'bg-amber-100 text-amber-700',
    Inactive: 'bg-slate-100 text-slate-600',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}

function IconButton({
  label,
  tone = 'default',
  onClick,
  children,
}: {
  label: string
  tone?: 'default' | 'danger'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-md border transition-colors ${
        tone === 'danger'
          ? 'border-red-100 text-red-600 hover:bg-red-50'
          : 'border-gray-200 text-[#064071] hover:bg-[#EEF7F5] hover:text-[#01AEAD]'
      }`}
    >
      {children}
    </button>
  )
}

function ApprovalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-semibold text-black">{value}</p>
    </div>
  )
}

function PracticeEditModal({
  practice,
  onClose,
  onSave,
}: {
  practice: PracticeRow | null
  onClose: () => void
  onSave: (practice: PracticeRow) => void
}) {
  if (!practice) {
    return null
  }

  return (
    <PracticeEditModalContent
      key={practice.id}
      practice={practice}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function PracticeEditModalContent({
  practice,
  onClose,
  onSave,
}: {
  practice: PracticeRow
  onClose: () => void
  onSave: (practice: PracticeRow) => void
}) {
  const [draft, setDraft] = useState(practice)

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit practice"
      className="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Practice name"
          value={draft.practice}
          onChange={(value) => setDraft({ ...draft, practice: value })}
        />
        <FormField
          label="Location"
          value={draft.location}
          onChange={(value) => setDraft({ ...draft, location: value })}
        />
        <FormField
          label="Owner"
          value={draft.owner}
          onChange={(value) => setDraft({ ...draft, owner: value })}
        />
        <SelectField
          label="Plan"
          value={draft.plan}
          options={['Starter', 'Professional', 'Enterprise']}
          onChange={(value) =>
            setDraft({
              ...draft,
              plan: value as PracticeRow['plan'],
              planTone:
                value === 'Enterprise'
                  ? 'blue'
                  : value === 'Professional'
                    ? 'teal'
                    : 'gray',
            })
          }
        />
        <FormField
          label="Rating"
          type="number"
          value={String(draft.rating)}
          onChange={(value) => setDraft({ ...draft, rating: Number(value) })}
        />
        <FormField
          label="Reviews"
          type="number"
          value={String(draft.reviews)}
          onChange={(value) => setDraft({ ...draft, reviews: Number(value) })}
        />
        <FormField
          label="Joined"
          value={draft.joined}
          onChange={(value) => setDraft({ ...draft, joined: value })}
        />
        <SelectField
          label="Status"
          value={draft.status}
          options={['Active', 'Pending', 'Inactive']}
          onChange={(value) =>
            setDraft({ ...draft, status: value as PracticeStatus })
          }
        />
      </div>
      <ModalActions onCancel={onClose} onSave={() => onSave(draft)} />
    </Modal>
  )
}

function OwnerEditModal({
  owner,
  onClose,
  onSave,
}: {
  owner: OwnerRow | null
  onClose: () => void
  onSave: (owner: OwnerRow) => void
}) {
  if (!owner) {
    return null
  }

  return (
    <OwnerEditModalContent
      key={owner.id}
      owner={owner}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function OwnerEditModalContent({
  owner,
  onClose,
  onSave,
}: {
  owner: OwnerRow
  onClose: () => void
  onSave: (owner: OwnerRow) => void
}) {
  const [draft, setDraft] = useState(owner)

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit pet owner"
      className="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="User"
          value={draft.user}
          onChange={(value) => setDraft({ ...draft, user: value })}
        />
        <FormField
          label="Email"
          value={draft.email}
          onChange={(value) => setDraft({ ...draft, email: value })}
        />
        <FormField
          label="Town"
          value={draft.town}
          onChange={(value) => setDraft({ ...draft, town: value })}
        />
        <FormField
          label="Pets"
          type="number"
          value={String(draft.pets)}
          onChange={(value) => setDraft({ ...draft, pets: Number(value) })}
        />
        <FormField
          label="Reviews"
          type="number"
          value={String(draft.reviews)}
          onChange={(value) => setDraft({ ...draft, reviews: Number(value) })}
        />
        <FormField
          label="Joined"
          value={draft.joined}
          onChange={(value) => setDraft({ ...draft, joined: value })}
        />
        <SelectField
          label="Status"
          value={draft.status}
          options={['Active', 'Inactive']}
          onChange={(value) =>
            setDraft({ ...draft, status: value as OwnerStatus })
          }
        />
      </div>
      <ModalActions onCancel={onClose} onSave={() => onSave(draft)} />
    </Modal>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ModalActions({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-10 items-center justify-center rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
      >
        Save changes
      </button>
    </div>
  )
}
