'use client'

import { useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { AnimalTypeBanner } from './animal-type-banner'
import { AnimalTypeCard } from './animal-type-card'
import type { AnimalTypeOption } from './animal-type-types'

const initialAnimalTypes: AnimalTypeOption[] = [
  { id: 'dogs', name: 'Dogs', image: '/images/pet.png', selected: true },
  { id: 'cats', name: 'Cats', image: '/images/cat-and-dog.png', selected: true },
  { id: 'horses', name: 'Horses', image: '/images/vet-1.png', selected: true },
  { id: 'birds', name: 'Birds', image: '/images/icon-1.png', selected: true },
  { id: 'rabbits', name: 'Rabbits', image: '/images/icon-2.png', selected: true },
  { id: 'reptiles', name: 'Reptiles', image: '/images/icon-3.png', selected: true },
  {
    id: 'farm-animals',
    name: 'Farm Animals',
    image: '/images/practice-1.png',
    selected: false,
  },
  { id: 'exotics', name: 'Exotics', image: '/images/icon-4.png', selected: false },
]

export function VetAnimalTypePage() {
  const [animalTypes, setAnimalTypes] = useState(initialAnimalTypes)
  const selectedAnimals = animalTypes.filter((animal) => animal.selected)

  return (
    <div className="space-y-6">
      <AnimalTypeBanner onSave={() => undefined} />

      <Card className="p-5">
        <div className="border-b border-gray-200/80 pb-4">
          <h2 className="text-base font-semibold text-black">
            {selectedAnimals.length} animal types selected
          </h2>
          <p className="mt-2 text-sm font-medium text-[#01AEAD]">
            {selectedAnimals.map((animal) => animal.name).join(' · ')}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {animalTypes.map((animal) => (
            <AnimalTypeCard
              key={animal.id}
              animal={animal}
              onToggle={() =>
                setAnimalTypes((current) =>
                  current.map((item) =>
                    item.id === animal.id
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
