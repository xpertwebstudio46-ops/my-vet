'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Eye,
  MessageSquareText,
  ShieldCheck,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { Card } from '@/components/dashboard/ui'

type StatCard = {
  label: string
  value: string
  icon: LucideIcon
}

type ApprovalCase = {
  id: string
  practice: string
  owner: string
  submitted: string
  detail: string
}

type ReviewItem = {
  id: string
  reviewer: string
  avatar: string
  practice: string
  status: string
  rating: string
  date: string
  body: string
}

const stats: StatCard[] = [
  { label: 'Total practices', value: '248', icon: Building2 },
  { label: 'Pet owners', value: '12.4k', icon: Users },
  { label: 'Total reviews', value: '8,392', icon: MessageSquareText },
  { label: 'Total revenue', value: '$84.2k', icon: DollarSign },
  { label: 'Pending approvals', value: '18', icon: ClipboardCheck },
]

const chartData = [
  { month: 'Mar', traffic: 38, signups: 18 },
  { month: 'Apr', traffic: 48, signups: 24 },
  { month: 'May', traffic: 44, signups: 31 },
  { month: 'Jun', traffic: 62, signups: 36 },
  { month: 'Jul', traffic: 71, signups: 45 },
  { month: 'Aug', traffic: 84, signups: 52 },
]

const approvalCases: ApprovalCase[] = [
  {
    id: 'case-1',
    practice: 'Green Paws Veterinary',
    owner: 'Maya Collins',
    submitted: 'Today',
    detail:
      'License verification and profile photos are ready for final approval.',
  },
  {
    id: 'case-2',
    practice: 'CityVet Wellness Clinic',
    owner: 'Daniel Brooks',
    submitted: 'Yesterday',
    detail: 'Updated address, operating hours and insurance documents.',
  },
  {
    id: 'case-3',
    practice: 'Northside Animal Care',
    owner: 'Hannah Lee',
    submitted: '2 days ago',
    detail: 'New practice registration with vaccination and surgery services.',
  },
]

const reviewItems: ReviewItem[] = [
  {
    id: 'review-1',
    reviewer: 'Ava Thompson',
    avatar: '/images/person-1.png',
    practice: 'Green Paws Veterinary',
    status: 'Pending',
    rating: '4.8',
    date: 'Aug 18, 2026',
    body: 'The clinic was helpful, but the waiting time details need admin review before publishing.',
  },
  {
    id: 'review-2',
    reviewer: 'Noah Williams',
    avatar: '/images/person-2.png',
    practice: 'CityVet Wellness Clinic',
    status: 'Flagged',
    rating: '3.9',
    date: 'Aug 17, 2026',
    body: 'This review includes a claim about billing that needs moderation before it goes live.',
  },
  {
    id: 'review-3',
    reviewer: 'Sophia Martinez',
    avatar: '/images/person-3.png',
    practice: 'Northside Animal Care',
    status: 'Pending',
    rating: '4.6',
    date: 'Aug 16, 2026',
    body: 'The review is complete and ready for approval after a quick content check.',
  },
  {
    id: 'review-4',
    reviewer: 'Liam Johnson',
    avatar: '/images/person-4.png',
    practice: 'Happy Tails Vet Center',
    status: 'Pending',
    rating: '4.4',
    date: 'Aug 15, 2026',
    body: 'The reviewer mentions a specific appointment issue that should be verified.',
  },
]

export function AdminDashboardPage() {
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)
  const [selectedCase, setSelectedCase] = useState<ApprovalCase | null>(null)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="dashboard-heading text-[48px] font-normal leading-tight text-black">
           Welcome back, Admin
          </h1>
          <p className="dashboard-font mt-1 text-sm text-muted-foreground">
            
            Directory health, moderation queue and revenue at a glance.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white  transition-colors hover:bg-[#052f52]"
        >
          <ShieldCheck className="size-4" />
          Review approvals
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card className="p-5">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
                Traffic and signups
              </h2>
              <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
                Last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#064071]" />
                Traffic
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#01AEAD]" />
                Signups
              </span>
            </div>
          </div>
          <LineChart />
        </Card>

        <Card className="">
          <div className="mb-4 flex items-center justify-between gap-3 p-4 border-b">
            <div>
              <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
                Pending approvals
              </h2>
           
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-[#01AEAD] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-1">
            {approvalCases.map((item) => (
              <div
                key={item.id}
                className="border-b px-3 pb-4"
              >
                <div className="flex items-start justify-between gap-3 pt-2">
                  <div className="min-w-0">
                    <h3 className="dashboard-font truncate text-sm font-semibold text-black">
                      {item.practice}
                    </h3>
                    <p className="dashboard-font mt-0.5 text-xs text-muted-foreground">
                      {item.owner} - {item.submitted}
                    </p>
                  </div>
                  {/* <span className="rounded-full bg-[#EEF7F5] px-2.5 py-1 text-[11px] font-semibold text-[#01AEAD]">
                    New
                  </span> */}
                </div>
                {/* <p className="dashboard-font mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {item.detail}
                </p> */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <ReviewButton onClick={() => setSelectedCase(item)} />
                  <ApproveButton />
                  <RemoveButton />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="w-full overflow-hidden p-0">
        <div className="border-b border-gray-200/80 p-5">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Latest reviews needing attention
          </h2>
          <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
            Moderate new reviews before they appear on practice profiles.
          </p>
        </div>
        <div className="divide-y divide-gray-200/80">
          {reviewItems.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              onReview={() => setSelectedReview(review)}
            />
          ))}
        </div>
      </Card>

      <Modal
        open={Boolean(selectedReview || selectedCase)}
        onClose={() => {
          setSelectedReview(null)
          setSelectedCase(null)
        }}
        title={selectedReview ? 'Review details' : 'Approval details'}
        className="max-w-lg"
      >
        {selectedReview && <ReviewDetails review={selectedReview} />}
        {selectedCase && <ApprovalDetails item={selectedCase} />}
      </Modal>
    </div>
  )
}

function StatCard({ stat }: { stat: StatCard }) {
  const Icon = stat.icon

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="dashboard-font text-[13px] font-medium text-muted-foreground">
            {stat.label}
          </p>
          <p className="dashboard-outfit mt-3 text-[24px] font-semibold text-black">
            {stat.value}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#01AEAD]">
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  )
}

function LineChart() {
  const width = 720
  const height = 300
  const chart = {
    left: 56,
    right: 24,
    top: 22,
    bottom: 46,
  }
  const maxValue = 90
  const yTicks = [0, 30, 60, 90]
  const plotWidth = width - chart.left - chart.right
  const plotHeight = height - chart.top - chart.bottom
  const xAxisY = chart.top + plotHeight

  function getPoint(index: number, value: number) {
    const x =
      chart.left +
      (index * plotWidth) / Math.max(chartData.length - 1, 1)
    const y = xAxisY - (value / maxValue) * plotHeight

    return { x, y }
  }

  function pointsFor(key: 'traffic' | 'signups') {
    return chartData
      .map((item, index) => {
        const { x, y } = getPoint(index, item[key])
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="h-[300px] w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Traffic and signups over the last six months"
      >
        {yTicks.map((tick) => {
          const y = xAxisY - (tick / maxValue) * plotHeight

          return (
            <g key={tick}>
              <line
                x1={chart.left}
                y1={y}
                x2={width - chart.right}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x={chart.left - 14}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[12px] font-medium"
              >
                {tick}
              </text>
            </g>
          )
        })}
        {chartData.map((item, index) => {
          const { x } = getPoint(index, item.traffic)

          return (
            <g key={item.month}>
              <line
                x1={x}
                y1={chart.top}
                x2={x}
                y2={xAxisY}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
              <text
                x={x}
                y={height - 14}
                textAnchor="middle"
                className="fill-slate-500 text-[12px] font-medium"
              >
                {item.month}
              </text>
            </g>
          )
        })}
        <line
          x1={chart.left}
          y1={chart.top}
          x2={chart.left}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1={chart.left}
          y1={xAxisY}
          x2={width - chart.right}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <text
          x={chart.left - 38}
          y={chart.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${chart.left - 38} ${
            chart.top + plotHeight / 2
          })`}
          className="fill-slate-500 text-[12px] font-semibold"
        >
          Count
        </text>
        <text
          x={chart.left + plotWidth / 2}
          y={height - 2}
          textAnchor="middle"
          className="fill-slate-500 text-[12px] font-semibold"
        >
          Months
        </text>
        <polyline
          points={pointsFor('traffic')}
          fill="none"
          stroke="#064071"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <polyline
          points={pointsFor('signups')}
          fill="none"
          stroke="#01AEAD"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {chartData.map((item, index) => {
          const traffic = getPoint(index, item.traffic)
          const signups = getPoint(index, item.signups)

          return (
            <g key={item.month}>
              <circle cx={traffic.x} cy={traffic.y} r="5" fill="#064071" />
              <circle cx={signups.x} cy={signups.y} r="5" fill="#01AEAD" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ReviewRow({
  review,
  onReview,
}: {
  review: ReviewItem
  onReview: () => void
}) {
  return (
    <div className="dashboard-font grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
      <div className="flex items-center gap-3">
      
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
          <Image
            src={review.avatar}
            alt={review.reviewer}
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <h3 className="truncate text-sm font-semibold text-black">
            {review.reviewer}
          </h3>
          <span className="hidden text-muted-foreground sm:inline">on</span>
          <p className="truncate text-sm font-medium text-[#064071]">
            {review.practice}
          </p>
        <span className="rounded-full bg-[#01AEAD] px-3 py-1 text-xs font-semibold text-white">
          {review.status}
        </span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {review.body}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <ReviewButton onClick={onReview} />
        <ApproveButton />
        <RemoveButton />
      </div>
    </div>
  )
}

function ReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-xs font-semibold text-[#064071] transition-colors hover:bg-[#F1F5F9]"
    >
      <Eye className="size-3.5" />
      Review
    </button>
  )
}

function ApproveButton() {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md  bg-[#01AEAD] px-3 text-xs font-semibold text-white"
    >
      <CheckCircle2 className="size-3.5" />
      Approve
    </button>
  )
}

function RemoveButton() {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/10 bg-destructive/10 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
    >
      <XCircle className="size-3.5" />
      Remove
    </button>
  )
}

function ReviewDetails({ review }: { review: ReviewItem }) {
  return (
    <div className="dashboard-font space-y-4">
      <div className="flex items-center gap-3">
        <span className="relative size-12 overflow-hidden rounded-full">
          <Image
            src={review.avatar}
            alt={review.reviewer}
            fill
            sizes="48px"
            className="object-cover"
          />
        </span>
        <div>
          <p className="text-sm font-semibold text-black">{review.reviewer}</p>
          <p className="text-xs text-muted-foreground">
            {review.practice} - {review.date}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-[#F8FAFC] p-4">
        <p className="text-sm font-semibold text-black">Rating {review.rating}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {review.body}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <ApproveButton />
        <RemoveButton />
      </div>
    </div>
  )
}

function ApprovalDetails({ item }: { item: ApprovalCase }) {
  return (
    <div className="dashboard-font space-y-4">
      <div className="rounded-xl bg-[#F8FAFC] p-4">
        <p className="text-sm font-semibold text-black">{item.practice}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Submitted by {item.owner} - {item.submitted}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {item.detail}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <ApproveButton />
        <RemoveButton />
      </div>
    </div>
  )
}
