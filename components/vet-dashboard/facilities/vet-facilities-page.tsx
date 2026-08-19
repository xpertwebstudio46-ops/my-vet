'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { FacilitiesBanner } from './facilities-banner'
import { FacilityCard } from './facility-card'
import type { FacilityOption } from './facility-types'

const initialFacilities: FacilityOption[] = [
  { id: 'parking', name: 'Parking', selected: true },
  { id: 'wheelchair-access', name: 'Wheelchair Access', selected: true },
  { id: 'emergency-room', name: 'Emergency Room', selected: true },
  { id: 'onsite-lab', name: 'On-site Lab', selected: true },
  { id: 'digital-xray', name: 'Digital X-ray', selected: true },
  { id: 'surgery-suite', name: 'Surgery Suite', selected: true },
  { id: 'pharmacy', name: 'Pharmacy', selected: true },
  { id: 'isolation-ward', name: 'Isolation Ward', selected: true },
  { id: 'ultrasound', name: 'Ultrasound', selected: false },
  { id: 'grooming-room', name: 'Grooming Room', selected: false },
]

export function VetFacilitiesPage() {
  const [facilities, setFacilities] = useState(initialFacilities)
  const selectedFacilities = facilities.filter((facility) => facility.selected)

  return (
    <div className="space-y-6">
      <FacilitiesBanner onSave={() => undefined} />

      <Card className="p-5">
        <div className="border-b border-gray-200/80 pb-4">
          <h2 className="text-base font-semibold text-black">
            {selectedFacilities.length} facilities selected
          </h2>
          <p className="mt-2 text-sm font-medium text-[#01AEAD]">
            {selectedFacilities.map((facility) => facility.name).join(' · ')}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onToggle={() =>
                setFacilities((current) =>
                  current.map((item) =>
                    item.id === facility.id
                      ? { ...item, selected: !item.selected }
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
