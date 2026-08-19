'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import { CategoryCard, type CategoryCardItem } from './category-card'
import { CategoryFormModal } from './category-form-modal'

const initialServices: CategoryCardItem[] = [
  {
    id: 'service-1',
    name: 'Vaccinations',
    description: 'Preventive vaccines and routine booster appointments.',
    image: '/images/icon-1.png',
    active: true,
    count: 1220,
  },
  {
    id: 'service-2',
    name: 'Dental Care',
    description: 'Dental cleaning, oral checks and tooth treatment services.',
    image: '/images/icon-2.png',
    active: true,
    count: 842,
  },
  {
    id: 'service-3',
    name: 'Diagnostics',
    description: 'Testing, imaging and lab diagnostics for faster care.',
    image: '/images/icon-3.png',
    active: true,
    count: 736,
  },
  {
    id: 'service-4',
    name: 'Surgery',
    description: 'Routine and advanced surgical care from listed practices.',
    image: '/images/icon-4.png',
    active: true,
    count: 418,
  },
  {
    id: 'service-5',
    name: 'Emergency Care',
    description: 'Urgent treatment and out-of-hours veterinary support.',
    image: '/images/icon-5.png',
    active: false,
    count: 265,
  },
  {
    id: 'service-6',
    name: 'Grooming',
    description: 'Bathing, clipping and coat-care appointments.',
    image: '/images/icon-6.png',
    active: true,
    count: 514,
  },
  {
    id: 'service-7',
    name: 'Microchipping',
    description: 'Pet identification and registration support.',
    image: '/images/check.png',
    active: false,
    count: 389,
  },
]

export function ServicesManagementPage() {
  const [services, setServices] = useState(initialServices)
  const [addOpen, setAddOpen] = useState(false)
  const [deletingService, setDeletingService] =
    useState<CategoryCardItem | null>(null)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Services Management"
        description="Manage service categories and see how many practices offer each one."
        action={{
          label: 'Add Service',
          icon: 'plus',
          tone: 'teal',
          onClick: () => setAddOpen(true),
        }}
      />

      <Card className="overflow-hidden p-0">
        <div>
          {services.map((service) => (
            <CategoryCard
              key={service.id}
              item={service}
              countLabel={`${service.count?.toLocaleString()} practices`}
              onToggle={() =>
                setServices((current) =>
                  current.map((item) =>
                    item.id === service.id
                      ? { ...item, active: !item.active }
                      : item,
                  ),
                )
              }
              onDelete={() =>
                setDeletingService(service)
              }
            />
          ))}
        </div>
      </Card>

      {addOpen && (
        <CategoryFormModal
          title="Add service category"
          defaultImage="/images/icon-1.png"
          showCount
          countLabel="Practice count"
          submitLabel="Add service"
          onClose={() => setAddOpen(false)}
          onAdd={(service) => {
            setServices((current) => [...current, service])
            setAddOpen(false)
          }}
        />
      )}

      {deletingService && (
        <ConfirmDeleteModal
          title="Delete service?"
          description={`This will remove ${deletingService.name} from service management.`}
          onClose={() => setDeletingService(null)}
          onConfirm={() => {
            setServices((current) =>
              current.filter((item) => item.id !== deletingService.id),
            )
            setDeletingService(null)
          }}
        />
      )}
    </div>
  )
}
