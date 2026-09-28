'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
type Appointment = {
  id: string
  date: string
  time: string
  reason: string
  notes: string | null
  status: AppointmentStatus
  pet: { name: string; species: string; breed: string | null } | null
  user: { firstName: string; lastName: string; email: string; phone: string | null }
}

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  CONFIRMED: 'bg-[#EEF7F5] text-[#01AEAD]',
  RESCHEDULED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-600',
  COMPLETED: 'bg-slate-100 text-slate-600',
  NO_SHOW: 'bg-red-50 text-red-600',
}

export function VetBookingsPage() {
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const result = await apiClient<Paginated<Appointment>>('/api/appointments/vet?view=all&page=1&limit=100')
      setItems(result.items)
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Bookings could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  async function transition(item: Appointment, action: 'confirm' | 'complete' | 'cancel') {
    try {
      if (action === 'cancel') {
        const reason = window.prompt('Cancellation reason:')
        if (!reason) return
        await apiClient(`/api/appointments/${item.id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) })
      } else {
        await apiClient(`/api/appointments/${item.id}/${action}`, { method: 'PATCH' })
      }
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, status: action === 'confirm' ? 'CONFIRMED' : action === 'complete' ? 'COMPLETED' : 'CANCELLED' } : value))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Booking could not be updated.')
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-heading text-[34px] font-normal leading-none text-black sm:text-[48px]">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">All appointment requests and booking records for your practice.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold text-[#064071]">
          <CalendarCheck className="size-4" />
          Refresh
        </button>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card className="overflow-hidden p-0">
        <div className="border-b p-5">
          <h2 className="font-semibold">Booking records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Pet</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(item.date))}</td>
                  <td className="p-4">{item.time}</td>
                  <td className="p-4">
                    <span className="block font-semibold">{item.pet?.name ?? 'Pet'}</span>
                    <span className="text-xs text-muted-foreground">{item.pet ? `${item.pet.species}${item.pet.breed ? ` - ${item.pet.breed}` : ''}` : 'No pet details'}</span>
                  </td>
                  <td className="p-4 font-medium">{item.user.firstName} {item.user.lastName}</td>
                  <td className="p-4">
                    <span className="block">{item.user.email}</span>
                    <span className="text-xs text-muted-foreground">{item.user.phone || 'No phone'}</span>
                  </td>
                  <td className="max-w-[220px] p-4">
                    <span className="block truncate font-medium">{item.reason}</span>
                    {item.notes && <span className="block truncate text-xs text-muted-foreground">{item.notes}</span>}
                  </td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}>{item.status.replace('_', ' ')}</span></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {['PENDING', 'RESCHEDULED'].includes(item.status) && <button type="button" onClick={() => void transition(item, 'confirm')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Confirm</button>}
                      {item.status === 'CONFIRMED' && <button type="button" onClick={() => void transition(item, 'complete')} className="rounded-md bg-[#01AEAD] px-3 py-2 text-xs font-semibold text-white">Complete</button>}
                      {['PENDING', 'RESCHEDULED', 'CONFIRMED'].includes(item.status) && <button type="button" onClick={() => void transition(item, 'cancel')} className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading bookings...</td></tr>}
              {!loading && !items.length && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
