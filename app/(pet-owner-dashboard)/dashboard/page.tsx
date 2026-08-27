'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck, Heart, MapPin, Star } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { BookAppointmentButton } from '@/components/appointments/book-appointment-modal'
import { Card, HighlightedTitle } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated, Practice } from '@/lib/api/types'

type Profile = { firstName: string; lastName: string; city: string | null }
type Pet = { id: string; name: string; species: string; breed: string | null; dateOfBirth: string | null; imageAsset: { url: string } | null }
type Appointment = { id: string; date: string; time: string; reason: string; status: string; pet: { name: string } | null; practice: { name: string; slug: string } }
type Review = { id: string; rating: number; comment: string; createdAt: string; practice: { name: string } }

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    void Promise.all([
      apiClient<Profile>('/api/users/me/profile'), apiClient<Pet[]>('/api/pets'), apiClient<Paginated<Appointment>>('/api/appointments?view=upcoming&page=1&limit=10'), apiClient<Review[]>('/api/reviews/me'), apiClient<Paginated<Practice>>('/api/practices?page=1&limit=6&sort=rating', {}, { authenticated: false }), apiClient<Practice[]>('/api/practices/saved'),
    ]).then(([profileData, petItems, appointmentResult, reviewItems, practiceResult, savedItems]) => {
      setProfile(profileData); setPets(petItems); setAppointments(appointmentResult.items); setReviews(reviewItems); setPractices(practiceResult.items); setSaved(new Set(savedItems.map((item) => item.id)))
    }).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Dashboard data could not be loaded.'))
  }, [])

  async function toggleSaved(practice: Practice) {
    try {
      const result = await apiClient<{ saved: boolean }>(`/api/practices/${practice.id}/save`, { method: 'POST' })
      setSaved((current) => { const next = new Set(current); if (result.saved) next.add(practice.id); else next.delete(practice.id); return next })
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Saved practices could not be updated.') }
  }

  const nextAppointment = appointments[0]
  const location = profile?.city || 'your area'
  return <div><div className="mb-6 rounded-2xl bg-white p-5 shadow-lg"><h1 className="dashboard-heading text-[34px] font-thin uppercase sm:text-[48px]"><HighlightedTitle title={`Hi ${profile?.firstName ?? user?.firstName ?? ''}`} /></h1><p className="text-sm text-muted-foreground">Your trusted vets near {location}. Book, review and keep track of your visits.</p></div>{error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{nextAppointment && <Card className="mb-6 border border-[#01AEAD]/10 bg-[#EEF7F5]"><div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="flex size-11 items-center justify-center rounded-md border border-[#01AEAD] bg-white"><CalendarCheck className="size-5 text-[#01AEAD]" /></span><div><p className="text-sm font-bold">{nextAppointment.pet?.name ?? 'Your pet'}: {nextAppointment.reason}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(nextAppointment.date))} at {nextAppointment.time} &middot; {nextAppointment.practice.name}</p></div></div><Link href="/appointment-history" className="rounded-md border bg-white px-4 py-2.5 text-sm font-medium">View appointment</Link></div></Card>}<div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><section className="rounded-xl bg-white shadow-lg"><div className="flex items-center justify-between border-b p-4"><h2 className="font-medium">Recommended practices</h2><Link href="/find-a-vet" className="text-xs font-medium text-brand hover:underline">View all practices</Link></div><div className="grid gap-3 p-3 sm:grid-cols-2">{practices.map((practice) => <PracticeMiniCard key={practice.id} practice={practice} saved={saved.has(practice.id)} onToggle={() => void toggleSaved(practice)} />)}{!practices.length && <p className="p-6 text-sm text-muted-foreground">No approved practices are available yet.</p>}</div></section><Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold">Need veterinary care?</h2><p className="mt-1 text-sm text-muted-foreground">Request a time with any approved practice.</p></div><BookAppointmentButton /></Card></div><div className="space-y-6"><Card className="p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-medium">My pets</h2><Link href="/my-profile" className="text-xs font-medium text-brand">Manage</Link></div><ul className="space-y-3">{pets.map((pet) => <li key={pet.id} className="flex items-center gap-3 rounded-md border p-3">{pet.imageAsset?.url ? <img src={pet.imageAsset.url} alt="" className="size-11 rounded-xl object-cover" /> : <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 font-semibold text-teal-700">{pet.name.slice(0, 1)}</span>}<div><p className="text-sm font-semibold">{pet.name}</p><p className="text-xs text-muted-foreground">{pet.breed || pet.species}</p></div></li>)}{!pets.length && <li className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No pets added yet.</li>}</ul></Card><Card className="p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-medium">Your latest reviews</h2><Link href="/my-reviews" className="text-xs font-medium text-brand">Manage</Link></div><ul className="space-y-3">{reviews.slice(0, 3).map((review) => <li key={review.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><p className="truncate text-sm font-semibold">{review.practice.name}</p><span className="flex items-center gap-1 text-xs font-semibold"><Star className="size-3.5 fill-warning text-warning" />{review.rating.toFixed(1)}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{review.comment}</p></li>)}{!reviews.length && <li className="text-sm text-muted-foreground">No reviews yet.</li>}</ul></Card></div></div></div>
}

function PracticeMiniCard({ practice, saved, onToggle }: { practice: Practice; saved: boolean; onToggle: () => void }) {
  const tags = [...(practice.animalTypes?.map(({ animalType }) => animalType.name) ?? []), ...(practice.services?.map((service) => service.name) ?? [])].slice(0, 3)
  return <Card className="flex flex-col border p-4"><div className="flex-1"><p className="font-semibold">{practice.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3 text-[#01AEAD]" />{practice.city}</p><p className="mt-2 flex items-center gap-1 text-xs"><Star className="size-3.5 fill-warning text-warning" />{Number(practice.rating).toFixed(1)} ({practice.reviewCount})</p><div className="mt-3 flex flex-wrap gap-1">{tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{tag}</span>)}</div></div><div className="mt-4 flex justify-between border-t pt-3"><Link href={`/vet-search/${practice.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#064071]">View profile <ArrowRight className="size-3" /></Link><button type="button" onClick={onToggle} aria-pressed={saved} className="inline-flex items-center gap-1 text-xs font-semibold text-[#064071]"><Heart className={`size-3.5 ${saved ? 'fill-[#01AEAD] text-[#01AEAD]' : ''}`} />{saved ? 'Saved' : 'Save'}</button></div></Card>
}
