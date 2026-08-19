'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { ConfirmDeleteModal } from '../shared/confirm-delete-modal'
import { CategoryCard, type CategoryCardItem } from './category-card'
import { CategoryFormModal } from './category-form-modal'

const initialAnimals: CategoryCardItem[] = [
  {
    id: 'animal-1',
    name: 'Dogs',
    description: '894 practices treat this animal.',
    image: '/images/pet.png',
    active: true,
  },
  {
    id: 'animal-2',
    name: 'Cats',
    description: '812 practices treat this animal.',
    image: '/images/cat-and-dog.png',
    active: true,
  },
  {
    id: 'animal-3',
    name: 'Horses',
    description: '326 practices treat this animal.',
    image: '/images/vet-1.png',
    active: true,
  },
  {
    id: 'animal-4',
    name: 'Farm Animals',
    description: '248 practices treat this animal.',
    image: '/images/cats-and-dog.png',
    active: false,
  },
  {
    id: 'animal-5',
    name: 'Birds',
    description: '174 practices treat this animal.',
    image: '/images/practice-1.png',
    active: true,
  },
  {
    id: 'animal-6',
    name: 'Exotic Pets',
    description: '139 practices treat this animal.',
    image: '/images/practice-2.png',
    active: true,
  },
  {
    id: 'animal-7',
    name: 'Small Mammals',
    description: '96 practices treat this animal.',
    image: '/images/practice-3.png',
    active: false,
  },
]

export function AnimalTypePage() {
  const [animals, setAnimals] = useState(initialAnimals)
  const [addOpen, setAddOpen] = useState(false)
  const [deletingAnimal, setDeletingAnimal] =
    useState<CategoryCardItem | null>(null)

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Animal Type"
        description="Manage animal categories available across the MY VET directory."
        action={{
          label: 'Add Category',
          icon: 'plus',
          tone: 'teal',
          onClick: () => setAddOpen(true),
        }}
      />

      <Card className="overflow-hidden p-0">
        <div>
          {animals.map((animal) => (
            <CategoryCard
              key={animal.id}
              item={animal}
              onToggle={() =>
                setAnimals((current) =>
                  current.map((item) =>
                    item.id === animal.id
                      ? { ...item, active: !item.active }
                      : item,
                  ),
                )
              }
              onDelete={() =>
                setDeletingAnimal(animal)
              }
            />
          ))}
        </div>
      </Card>

      {addOpen && (
        <CategoryFormModal
          title="Add animal category"
          defaultImage="/images/pet.png"
          onClose={() => setAddOpen(false)}
          onAdd={(animal) => {
            setAnimals((current) => [...current, animal])
            setAddOpen(false)
          }}
        />
      )}

      {deletingAnimal && (
        <ConfirmDeleteModal
          title="Delete animal type?"
          description={`This will remove ${deletingAnimal.name} from animal types.`}
          onClose={() => setDeletingAnimal(null)}
          onConfirm={() => {
            setAnimals((current) =>
              current.filter((item) => item.id !== deletingAnimal.id),
            )
            setDeletingAnimal(null)
          }}
        />
      )}
    </div>
  )
}
