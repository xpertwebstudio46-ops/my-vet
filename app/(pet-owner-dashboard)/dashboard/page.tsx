'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CalendarCheck, Heart, MapPin, Star } from 'lucide-react'
import {
  appointments,
  currentUser,
  pets,
  practices,
  reviews,
} from '@/lib/dashboard-data'
import {
  Card,
  HighlightedTitle,
} from '@/components/dashboard/ui'
import {
  readSavedPracticeIds,
  writeSavedPracticeIds,
} from '@/lib/saved-practice-storage'

const nextAppointment = appointments.find((a) => a.type === 'Upcoming')
const recentlyViewed = practices.slice(0, 3)
const recommended = practices.slice(3, 6)

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-lg shadow-black/10">
        <h1 className="dashboard-heading text-[48px] font-thin uppercase ">
          <HighlightedTitle title={`Hi ${currentUser.firstName}`} />
        </h1>
        <p className=" text-sm text-muted-foreground">
          Your trusted vets near {currentUser.location}. Book, review and keep
          track of your visits.
        </p>
      </div>

      {/* Upcoming appointment banner */}
      {nextAppointment && (
        <Card className="mb-6 border border-[#01AEAD]/10 bg-[#EEF7F5]">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#01AEAD] rounded-md text-success-foreground">
                <CalendarCheck className="size-5 text-[#01AEAD]" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {nextAppointment.petName}: {nextAppointment.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {nextAppointment.date} at {nextAppointment.time} ·{' '}
                  {nextAppointment.practice}
                </p>
              </div>
            </div>
            <Link
              href="/appointment-history"
             className="shrink-0 bg-white text-black border border-gray-400/10 px-4 py-2.5 font-medium border border-gray-400/50 rounded-md"
            >
              View appointment
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recently viewed */}
          <section className='bg-white shadow-lg border border-gray-400/30  rounded-xl'>
            <div className="mb-3 flex items-center justify-between border-b p-3">
              <h2 className="dashboard-outfit font-medium text-md">
                Recently viewed practices
              </h2>
              <Link
                href="/find-a-vet"
                className="text-xs font-medium text-brand hover:underline"
              >
                View all practices
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3   rounded-md sm:grid-cols-2">
              {recentlyViewed.map((p) => (
                <PracticeMiniCard key={p.id} id={p.id} />
              ))}
            </div>
          </section>

          {/* Recommended */}
          <section className='bg-white shadow-lg rounded-xl'>
            <div className="mb-3 flex items-center justify-between border-b p-3">
              <h2 className="dashboard-outfit text-md font-medium">
                Recommended for you
              </h2>
              <span className="text-xs text-muted-foreground">
                Based on your pets and location
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommended.map((p) => (
                <PracticeMiniCard key={p.id} id={p.id} />
              ))}
            </div>
          </section>
        </div>

        {/* Side rail */}
        <div className="space-y-6">
          {/* My pets */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="dashboard-outfit text-md font-medium text-md">
                My pets
              </h2>
              <Link
                href="/my-profile"
                className="text-xs font-medium text-brand hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="space-y-3">
              {pets.map((pet) => (
                <li key={pet.id} className="flex items-center gap-3 border border p-3 rounded-md">
                  <span className="relative size-11 overflow-hidden rounded-xl">
                    <Image
                      src={pet.image || '/placeholder.svg'}
                      alt={pet.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{pet.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pet.breed} · {pet.age}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Latest reviews */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="dashboard-outfit text-md font-medium">
                Your latest reviews
              </h2>
              <Link
                href="/my-reviews"
                className="text-xs font-medium text-brand hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {r.practice}
                    </p>
                    <span className="flex items-center gap-0.5 text-xs font-semibold">
                      <Star className="size-3.5 fill-warning text-warning" />
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {r.body}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    {r.date}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PracticeMiniCard({ id }: { id: string }) {
  const p = practices.find((x) => x.id === id)!
  const [saved, setSaved] = useState(() =>
    readSavedPracticeIds().includes(p.id),
  )
  const tags = getPracticeCardTags()

  function toggleSaved() {
    const savedIds = readSavedPracticeIds()
    const nextSaved = !saved
    const nextIds = nextSaved
      ? Array.from(new Set([...savedIds, p.id]))
      : savedIds.filter((savedId) => savedId !== p.id)

    writeSavedPracticeIds(nextIds)
    setSaved(nextSaved)
  }

  return (
    <Card className="dashboard-outfit m-3 flex flex-col border border-gray-400/30 p-3 text-base font-medium">
      <div className="flex items-start gap-3">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={p.image || '/placeholder.svg'}
            alt={p.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-base font-medium">{p.name}</p>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 text-[#01AEAD]" />
            {p.location} - {p.distance}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <FiveStarRating value={p.rating} />
            <span className="text-xs font-semibold text-foreground">
              {p.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex min-h-[28px] flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${
            p.openNow
              ? 'bg-[#EEF7F5] text-[#01AEAD]'
              : 'bg-[#F1F5F9] text-muted-foreground'
          }`}
        >
          {p.openNow ? 'Open now' : 'Closed'}
        </span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[0.7rem] font-medium text-[#163B6D]"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 border-t border-gray-200/70" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href="/find-a-vet"
          className="inline-flex items-center gap-1 rounded-md border border-gray-400/30 bg-white px-3 py-2 text-xs font-semibold text-[#064071] transition-colors hover:bg-[#F1F5F9]"
        >
          View profile <ArrowRight className="size-3" />
        </Link>
        <button
          type="button"
          onClick={toggleSaved}
          className="inline-flex items-center gap-1 rounded-md border border-gray-400/30 bg-white px-3 py-2 text-xs font-semibold text-[#064071] transition-colors hover:bg-[#F1F5F9]"
          aria-pressed={saved}
        >
          <Heart className={`size-3.5 ${saved ? 'fill-[#01AEAD]' : ''}`} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </Card>
  )
}

function FiveStarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-3 ${
            index < Math.round(value)
              ? 'fill-warning text-warning'
              : 'fill-transparent text-muted-foreground/35'
          }`}
        />
      ))}
    </span>
  )
}

function getPracticeCardTags() {
  return ['Dog', 'Cat']
}
