'use client'

import { useState } from 'react'
import { HealthPackagesCard } from './health-packages-card'
import { PricingBanner } from './pricing-banner'
import { PricingCard } from './pricing-card'
import { PricingItemModal } from './pricing-item-modal'
import { PricingNote } from './pricing-note'
import { ConfirmDeleteModal } from '../team-members/confirm-delete-modal'
import type { HealthPackage, PriceItem, PricingSection } from './pricing-types'

const initialSections: PricingSection[] = [
  {
    id: 'consultation',
    title: 'Consultation fees',
    items: [
      { label: 'Standard consultation (15 min)', price: '\u00a345' },
      { label: 'Extended consultation (30 min)', price: '\u00a370' },
      { label: 'Extended consultation (30 min)', price: '\u00a370' },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency fees',
    items: [{ label: 'Out-of-hours triage', price: '\u00a395' }],
  },
  {
    id: 'vaccination',
    title: 'Vaccination prices',
    items: [
      { label: 'Puppy primary course', price: '\u00a372' },
      { label: 'Kitten primary course', price: '\u00a368' },
      { label: 'Annual booster', price: '\u00a352' },
      { label: 'Rabbit RHD/Myxo', price: '\u00a348' },
    ],
  },
  {
    id: 'surgery',
    title: 'Surgery prices',
    items: [
      { label: 'Cat spay', price: '\u00a3145' },
      { label: 'Dog castration (small breed)', price: '\u00a3165' },
      { label: 'Dental with extractions', price: '\u00a3220' },
    ],
  },
]

const initialPackages: HealthPackage[] = [
  {
    id: 'puppy-start',
    name: 'Puppy Start Plan',
    price: '\u00a318/mo',
    description:
      'First-year support with routine checks, reminders and preventive care guidance.',
  },
  {
    id: 'senior-wellness',
    name: 'Senior Wellness Plan',
    price: '\u00a324/mo',
    description:
      'Ongoing checks for older pets with wellness monitoring and owner support.',
  },
  {
    id: 'feline-care',
    name: 'Feline Care Plan',
    price: '\u00a320/mo',
    description:
      'Cat-focused preventive care with routine appointments and annual planning.',
  },
]

export function VetPricingPage() {
  const [sections, setSections] = useState(initialSections)
  const [packages, setPackages] = useState(initialPackages)
  const [addingSection, setAddingSection] = useState<PricingSection | null>(
    null,
  )
  const [editingItem, setEditingItem] = useState<{
    section: PricingSection
    index: number
    item: PriceItem
  } | null>(null)
  const [deletingItem, setDeletingItem] = useState<{
    section: PricingSection
    index: number
    item: PriceItem
  } | null>(null)

  function updatePrice(sectionId: string, index: number, price: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, price } : item,
              ),
            }
          : section,
      ),
    )
  }

  function addPriceItem(sectionId: string, item: PriceItem) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items, item],
            }
          : section,
      ),
    )
    setAddingSection(null)
  }

  function editPriceItem(sectionId: string, index: number, item: PriceItem) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((priceItem, itemIndex) =>
                itemIndex === index ? item : priceItem,
              ),
            }
          : section,
      ),
    )
    setEditingItem(null)
  }

  function deletePriceItem(sectionId: string, index: number) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((_, itemIndex) => itemIndex !== index),
            }
          : section,
      ),
    )
    setDeletingItem(null)
  }

  function updatePackagePrice(packageId: string, price: string) {
    setPackages((current) =>
      current.map((item) => (item.id === packageId ? { ...item, price } : item)),
    )
  }

  return (
    <div className="space-y-6">
      <PricingBanner onSave={() => undefined} />
      <PricingNote />

      <div className="grid gap-5 xl:grid-cols-2">
        {sections.map((section) => (
          <PricingCard
            key={section.id}
            title={section.title}
            items={section.items}
            onPriceChange={(index, value) =>
              updatePrice(section.id, index, value)
            }
            onEdit={(index) =>
              setEditingItem({
                section,
                index,
                item: section.items[index],
              })
            }
            onDelete={(index) =>
              setDeletingItem({
                section,
                index,
                item: section.items[index],
              })
            }
            onAdd={() => setAddingSection(section)}
          />
        ))}
      </div>

      <HealthPackagesCard
        packages={packages}
        onPriceChange={updatePackagePrice}
      />

      {addingSection && (
        <PricingItemModal
          sectionTitle={addingSection.title}
          onClose={() => setAddingSection(null)}
          onSave={(item) => addPriceItem(addingSection.id, item)}
        />
      )}

      {editingItem && (
        <PricingItemModal
          sectionTitle={editingItem.section.title}
          item={editingItem.item}
          onClose={() => setEditingItem(null)}
          onSave={(item) =>
            editPriceItem(editingItem.section.id, editingItem.index, item)
          }
        />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          title="Delete price?"
          description={`This will remove ${deletingItem.item.label} from ${deletingItem.section.title}.`}
          onClose={() => setDeletingItem(null)}
          onConfirm={() =>
            deletePriceItem(deletingItem.section.id, deletingItem.index)
          }
        />
      )}
    </div>
  )
}
