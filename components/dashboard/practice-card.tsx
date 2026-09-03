'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { SavePracticeButton } from '@/components/practices/save-practice-button'
import { buttonVariants } from '@/components/ui/button'
import { practiceMembershipLabel } from '@/lib/practice-cards'
import type { PracticeMembershipType } from '@/lib/api/types'

export type PracticeCardItem = {
  id: string
  slug?: string
  name: string
  image: string
  location: string
  distance?: string
  rating: number
  reviews: number
  tags: string[]
  description: string
  membershipType?: PracticeMembershipType
  branchCount?: number
}

export function PracticeCard({
  practice,
  showSaveAction = true,
}: {
  practice: PracticeCardItem
  favourited?: boolean
  showSaveAction?: boolean
}) {
  return (
    <div className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white bg-white font-sans shadow-lg shadow-black/10 transition-shadow hover:shadow-xl">
      <div className="relative h-36 w-full overflow-hidden sm:h-40">
        <img
          src={practice.image}
          alt={practice.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 max-w-[calc(100%-5rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#064071] shadow-sm shadow-black/10">
          {practiceMembershipLabel(practice.membershipType)}
        </span>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-sans text-xs shadow-md shadow-black/10">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-semibold text-foreground">
              {practice.rating.toFixed(1)}
            </span>
          </div>
          {showSaveAction && (
            <SavePracticeButton
              practiceId={practice.id}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm disabled:opacity-60"
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="font-manrope text-base font-bold leading-tight text-primary text-balance sm:text-[18.03px]">
          {practice.name}
        </h3>
        <div className="mt-1 flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#01AEAD]" />
          <span className="min-w-0 break-words">
            {practice.location}{practice.distance ? ` - ${practice.distance}` : ''}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {practice.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {practice.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[0.7rem] font-medium text-[#163B6D]"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-full font-sans text-xs font-medium text-muted-foreground sm:px-3 sm:py-1.5">
            {practice.reviews} Reviews
          </div>
          <Link href={practice.slug ? `/vet-search/${practice.slug}` : '/vet-search'} className={buttonVariants({ size: 'lg', className: 'w-full rounded-full bg-[#064071] px-4 text-white hover:bg-[#05365f] sm:w-auto' })}>
            View Profile
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
