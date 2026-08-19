'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { ConfirmDeleteModal } from '../team-members/confirm-delete-modal'
import { ServiceFormModal } from './service-form-modal'
import { ServiceRow } from './service-row'
import { ServicesBanner } from './services-banner'
import type { VetService } from './service-types'

const initialServices: VetService[] = [
  {
    id: 'service-1',
    name: 'Vaccination',
    description: 'Core vaccines, booster plans and routine protection visits.',
    price: '£23',
    active: true,
  },
  {
    id: 'service-2',
    name: 'Dental care',
    description: 'Dental checks, scale and polish, and oral health guidance.',
    price: '£49',
    active: true,
  },
  {
    id: 'service-3',
    name: 'Diagnostics',
    description: 'Blood tests, imaging and lab work for faster treatment plans.',
    price: '£65',
    active: true,
  },
  {
    id: 'service-4',
    name: 'Soft tissue surgery',
    description: 'Routine surgical procedures with pre and post-operative care.',
    price: '£180',
    active: true,
  },
  {
    id: 'service-5',
    name: 'Microchipping',
    description: 'Pet identification chip placement and registration support.',
    price: '£18',
    active: true,
  },
  {
    id: 'service-6',
    name: 'Emergency consultation',
    description: 'Urgent triage and same-day care for unwell pets.',
    price: '£95',
    active: true,
  },
  {
    id: 'service-7',
    name: 'Nurse clinic',
    description: 'Weight checks, nail clips and ongoing care appointments.',
    price: '£28',
    active: true,
  },
  {
    id: 'service-8',
    name: 'Grooming',
    description: 'Coat care and comfort grooming appointments.',
    price: '£38',
    active: false,
  },
]

export function VetServicesPage() {
  const [services, setServices] = useState(initialServices)
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<VetService | null>(null)
  const liveCount = services.filter((service) => service.active).length

  function addService(service: VetService) {
    setServices((current) => [...current, service])
    setAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <ServicesBanner onAdd={() => setAddOpen(true)} />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-200/80 px-5 py-4">
          <h2 className="text-base font-semibold text-black">
            {liveCount} of {services.length} services live
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn a service off to hide it without deleting your pricing.
          </p>
        </div>

        <div>
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onToggle={() =>
                setServices((current) =>
                  current.map((item) =>
                    item.id === service.id
                      ? { ...item, active: !item.active }
                      : item,
                  ),
                )
              }
              onDelete={() => setDeleting(service)}
            />
          ))}
        </div>
      </Card>

      {addOpen && (
        <ServiceFormModal
          onClose={() => setAddOpen(false)}
          onAdd={addService}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          title="Delete service?"
          description={`This will remove ${deleting.name} from your service list.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setServices((current) =>
              current.filter((service) => service.id !== deleting.id),
            )
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
