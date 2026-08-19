'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Bookmark, MapPin, Search, Star, Trash2 } from 'lucide-react'
import { practices, savedPractices } from '@/lib/dashboard-data'
import { Card, StatusBadge } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import {
  readSavedPracticeIds,
  SAVED_PRACTICES_CHANGED_EVENT,
  writeSavedPracticeIds,
} from '@/lib/saved-practice-storage'

export default function SavedPracticesPage() {
  const [items, setItems] = useState(savedPractices)

  useEffect(() => {
    function syncSavedPractices() {
      setItems(getSavedPracticeItems())
    }

    syncSavedPractices()
    window.addEventListener(SAVED_PRACTICES_CHANGED_EVENT, syncSavedPractices)
    window.addEventListener('storage', syncSavedPractices)

    return () => {
      window.removeEventListener(
        SAVED_PRACTICES_CHANGED_EVENT,
        syncSavedPractices,
      )
      window.removeEventListener('storage', syncSavedPractices)
    }
  }, [])

  function removePractice(id: string) {
    const savedIds = readSavedPracticeIds()

    setItems((prev) => prev.filter((practice) => practice.id !== id))

    if (savedIds.includes(id)) {
      writeSavedPracticeIds(savedIds.filter((savedId) => savedId !== id))
    }
  }

  return (
    <div className="mx-auto max-w-5xl ">
      <div className="mb-6 flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-5 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">
            Saved veterinary practices
          </h1>
          <p className="dashboard-font mt-1 max-w-2xl text-[16px] font-normal text-muted-foreground">
            A shortlist you can compare side by side before you book.
          </p>
        </div>
        <Link
          href="/find-a-vet"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          <Search className="size-4" />
          Add new search
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved practices yet"
          description="Save practices from your search results to quickly find them again here."
          action={
            <Link href="/find-a-vet" className={buttonVariants({ size: 'sm' })}>
              Find a vet
            </Link>
          }
        />
      ) : (
        <Card className="p-2 sm:p-3">
          <ul className="divide-y divide-border">
            {items.map((practice) => (
              <li
                key={practice.id}
                className="flex flex-col gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={getPracticeImage(practice.name)}
                    alt={practice.name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="dashboard-outfit text-[16px] font-semibold text-primary">
                        {practice.name}
                      </h3>
                      <StatusBadge
                        label={practice.openNow ? 'Open now' : 'Closed'}
                        variant={practice.openNow ? 'Open' : 'Closed'}
                      />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {practice.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <SavedPracticeRating value={practice.rating} />
                  <button
                    type="button"
                    onClick={() => removePractice(practice.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function getSavedPracticeItems() {
  const savedIds = readSavedPracticeIds()
  const savedFromCards = practices
    .filter((practice) => savedIds.includes(practice.id))
    .map((practice) => ({
      id: practice.id,
      name: practice.name,
      location: `${practice.location} - ${practice.distance}`,
      rating: practice.rating,
      reviews: practice.reviews,
      openNow: practice.openNow,
    }))
  const staticNames = new Set(savedPractices.map((practice) => practice.name))

  return [
    ...savedPractices,
    ...savedFromCards.filter((practice) => !staticNames.has(practice.name)),
  ]
}

function getPracticeImage(name: string) {
  return (
    practices.find((practice) => practice.name === name)?.image ??
    '/placeholder.svg'
  )
}

function SavedPracticeRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-3.5 ${
            index < Math.round(value)
              ? 'fill-warning text-warning'
              : 'fill-transparent text-muted-foreground/35'
          }`}
        />
      ))}
      <span className="ml-1 font-semibold text-foreground">
        {value.toFixed(1)}
      </span>
    </div>
  )
}
