'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

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
}

export function PracticeCard({
  practice,
}: {
  practice: PracticeCardItem
  favourited?: boolean
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white bg-white font-sans shadow-lg shadow-black/10 transition-shadow hover:shadow-xl">
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={practice.image}
          alt={practice.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-sans text-xs shadow-md shadow-black/10">
          <Star className="size-3.5 fill-warning text-warning" />
          <span className="font-semibold text-foreground">
            {practice.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-manrope text-[18.03px] font-bold leading-tight text-primary text-balance">
          {practice.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-[#01AEAD]" />
          <span>
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
        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <div className="rounded-full px-3 py-1.5 font-sans text-xs font-medium text-muted-foreground ">
            {practice.reviews} Reviews
          </div>
          <Link href={practice.slug ? `/vet-search/${practice.slug}` : '/vet-search'} className={buttonVariants({ size: 'lg', className: 'rounded-full bg-[#064071] px-4 text-white hover:bg-[#05365f]' })}>
            View Profile
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
