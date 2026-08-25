'use client'

import { useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { useAuth } from '@/components/auth/AuthProvider'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated, Practice } from '@/lib/api/types'

type Pet = { id: string; name: string }
const minimumAppointmentDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

export function BookAppointmentButton({ practiceId, practiceName, className }: { practiceId?: string; practiceName?: string; className?: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [form, setForm] = useState({ practiceId: practiceId ?? '', petId: '', date: '', time: '', reason: '', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || user?.role !== 'PET_OWNER') return
    const requests: [Promise<Pet[]>, Promise<Paginated<Practice>> | null] = [apiClient<Pet[]>('/api/pets'), practiceId ? null : apiClient<Paginated<Practice>>('/api/practices?page=1&limit=100&sort=rating', {}, { authenticated: false })]
    void Promise.all([requests[0], requests[1] ?? Promise.resolve({ items: [], total: 0, page: 1, limit: 100, totalPages: 1 })]).then(([petItems, practiceResult]) => {
      setPets(petItems); setPractices(practiceResult.items)
      setForm((current) => ({ ...current, practiceId: practiceId ?? current.practiceId, petId: current.petId || petItems[0]?.id || '' }))
    }).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Booking options could not be loaded.'))
  }, [open, practiceId, user?.role])

  function close() {
    setOpen(false); setError(''); setSuccess('')
    setForm({ practiceId: practiceId ?? '', petId: '', date: '', time: '', reason: '', notes: '' })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const appointment = await apiClient<{ id: string }>('/api/appointments', { method: 'POST', body: JSON.stringify({ ...form, notes: form.notes || null }) })
      setSuccess('Your appointment request has been sent to the practice.')
      window.dispatchEvent(new CustomEvent('myvet:appointment-created', { detail: appointment }))
    } catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'The appointment could not be booked.') } finally { setLoading(false) }
  }

  return <><button type="button" onClick={() => setOpen(true)} className={className ?? 'inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-medium text-white hover:bg-[#05365f]'}><CalendarPlus className="size-4" />Book appointment</button><Modal open={open} onClose={close} title={practiceName ? `Book with ${practiceName}` : 'Book an appointment'} description="Choose a practice, pet and preferred future time." className="max-w-xl">{user?.role !== 'PET_OWNER' ? <div><p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Please sign in with a pet-owner account to book an appointment.</p><div className="mt-4 flex justify-end"><a href="/login" className="rounded-md bg-[#064071] px-4 py-2 text-sm font-semibold text-white">Sign in</a></div></div> : success ? <div><p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p><div className="mt-4 flex justify-end"><button type="button" onClick={close} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white">Done</button></div></div> : <form onSubmit={(event) => void submit(event)} className="grid gap-4">{!practiceId && <label className="text-sm font-medium">Practice<select required value={form.practiceId} onChange={(event) => setForm({ ...form, practiceId: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Choose a practice</option>{practices.map((practice) => <option key={practice.id} value={practice.id}>{practice.name} - {practice.city}</option>)}</select></label>}<label className="text-sm font-medium">Pet<select required value={form.petId} onChange={(event) => setForm({ ...form, petId: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Choose a pet</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></label>{!pets.length && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Add a pet to your profile before booking.</p>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Date<input required type="date" min={minimumAppointmentDate} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><label className="text-sm font-medium">Time<input required type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label></div><label className="text-sm font-medium">Reason<input required minLength={3} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="e.g. Annual vaccination" className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><label className="text-sm font-medium">Notes (optional)<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-md border p-3 text-sm" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={close} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button disabled={loading || !pets.length} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Booking...' : 'Request appointment'}</button></div></form>}</Modal></>
}
