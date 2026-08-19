'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { StarRating } from '../shared/star-rating'
import { StatusPill } from '../shared/status-pill'

type FeaturedBoost = {
  id: string
  practice: string
  town: string
  stars: number
  expires: string
  impressions: string
  spend: string
  status: 'Active' | 'Pending' | 'Inactive'
}

type UpgradeRequest = {
  id: string
  practice: string
  request: string
}

const initialBoosts: FeaturedBoost[] = [
  {
    id: 'boost-1',
    practice: 'Green Paws Veterinary',
    town: 'Oxford',
    stars: 4.8,
    expires: 'Sep 14, 2026',
    impressions: '18,420',
    spend: '£840',
    status: 'Active',
  },
  {
    id: 'boost-2',
    practice: 'CityVet Wellness Clinic',
    town: 'Bicester',
    stars: 4.6,
    expires: 'Sep 02, 2026',
    impressions: '12,806',
    spend: '£620',
    status: 'Active',
  },
  {
    id: 'boost-3',
    practice: 'Oakridge Equine Care',
    town: 'Reading',
    stars: 4.4,
    expires: 'Aug 28, 2026',
    impressions: '8,931',
    spend: '£390',
    status: 'Pending',
  },
]

const initialRequests: UpgradeRequest[] = [
  {
    id: 'request-1',
    practice: 'Willow Farm Veterinary',
    request: 'Free -> Professional · requested 4 hrs ago',
  },
  {
    id: 'request-2',
    practice: 'Summertown Vet Care',
    request: 'Professional -> Premium · requested 8 hrs ago',
  },
]

export function FeaturedListingsPage() {
  const [boosts] = useState(initialBoosts)
  const [requests, setRequests] = useState(initialRequests)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Featured Listings"
        description="Manage promoted practices, active boosts and upgrade requests."
        action={{ label: 'Feature Practice', icon: 'plus', tone: 'blue' }}
      />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-200/80 p-5">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Active & recent boosts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left">
            <thead className="border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Practice</th>
                <th className="px-5 py-4">Town</th>
                <th className="px-5 py-4">Stars</th>
                <th className="px-5 py-4">Expires</th>
                <th className="px-5 py-4">Impressions</th>
                <th className="px-5 py-4">Spend</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {boosts.map((boost, index) => (
                <tr
                  key={boost.id}
                  className={index === boosts.length - 1 ? '' : 'border-b border-gray-200/80'}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {boost.practice}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {boost.town}
                  </td>
                  <td className="px-5 py-4">
                    <StarRating value={boost.stars} />
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {boost.expires}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {boost.impressions}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    {boost.spend}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={boost.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-200/80 p-5">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Upgrade requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manual approvals for plan changes
          </p>
        </div>
        <div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col gap-4 border-b border-gray-200/80 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-black">
                  {request.practice}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.request}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRequests((current) =>
                      current.filter((item) => item.id !== request.id),
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white hover:bg-[#019594]"
                >
                  <Check className="size-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRequests((current) =>
                      current.filter((item) => item.id !== request.id),
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-500 bg-transparent px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <X className="size-4" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
