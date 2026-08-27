'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, CalendarPlus, XCircle } from 'lucide-react'
import { BookAppointmentButton } from '@/components/appointments/book-appointment-modal'
import { Card } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'
import { Modal } from '@/components/dashboard/modal'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
type Appointment = { id: string; date: string; time: string; reason: string; notes: string | null; status: AppointmentStatus; pet: { id: string; name: string } | null; practice: { id: string; name: string; slug: string } }
const statusStyles: Record<AppointmentStatus, string> = { PENDING: 'bg-amber-50 text-amber-800', CONFIRMED: 'bg-[#EEF7F5] text-[#01AEAD]', RESCHEDULED: 'bg-blue-50 text-blue-700', CANCELLED: 'bg-red-50 text-red-600', COMPLETED: 'bg-slate-100 text-slate-600', NO_SHOW: 'bg-red-50 text-red-600' }
const minimumAppointmentDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

export default function AppointmentHistoryPage() {
  const [items, setItems] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<Appointment | null>(null)
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await apiClient<Paginated<Appointment>>('/api/appointments?view=all&page=1&limit=100'); setItems(result.items) }
    catch (caught) { setError(caught instanceof ApiClientError ? caught.message : 'Appointments could not be loaded.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => void load()); const created = () => void load(); window.addEventListener('myvet:appointment-created', created); return () => window.removeEventListener('myvet:appointment-created', created) }, [load])

  const now = new Date().toISOString().slice(0, 10)
  const isUpcoming = (item: Appointment) => item.date.slice(0, 10) >= now && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(item.status)
  const upcoming = items.filter(isUpcoming)
  const previous = items.filter((item) => !isUpcoming(item))
  const visible = activeTab === 'upcoming' ? upcoming : previous

  async function cancel(reason: string) {
    if (!cancelling) return
    try { const updated = await apiClient<Appointment>(`/api/appointments/${cancelling.id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }); setItems((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setCancelling(null) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Appointment could not be cancelled.') }
  }

  async function reschedule(date: string, time: string) {
    if (!rescheduling) return
    try { const updated = await apiClient<Appointment>(`/api/appointments/${rescheduling.id}`, { method: 'PUT', body: JSON.stringify({ date, time }) }); setItems((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setRescheduling(null) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Appointment could not be rescheduled.') }
  }

  return <div className="mx-auto max-w-5xl"><div className="mb-4 flex flex-col gap-4 rounded-md border bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between"><div><h1 className="dashboard-heading text-[34px] font-normal leading-none text-black sm:text-[48px]">Appointment History</h1><p className="text-sm text-muted-foreground">Track upcoming and past appointments for your pets.</p></div><BookAppointmentButton /></div>{error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="mb-6 flex gap-2 rounded-md border bg-white p-2 shadow-lg">{([{ label: 'Upcoming', value: 'upcoming' as const, count: upcoming.length }, { label: 'Previous', value: 'previous' as const, count: previous.length }]).map((tab) => <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)} className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium ${activeTab === tab.value ? 'bg-[#EEF7F5] text-[#01AEAD]' : 'text-muted-foreground hover:bg-slate-50'}`}>{tab.label}<span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-[#064071] shadow-sm">{tab.count}</span></button>)}</div>{loading ? <Card className="p-8 text-center text-sm text-muted-foreground">Loading appointments...</Card> : !visible.length ? <EmptyState icon={CalendarClock} title="No appointments yet" description={activeTab === 'upcoming' ? 'Book an appointment and it will appear here.' : 'Your completed and cancelled appointments will appear here.'} /> : <Card className="p-2 sm:p-3"><ul className="divide-y">{visible.map((appointment) => { const date = new Date(appointment.date); return <li key={appointment.id} className="flex flex-col gap-4 px-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-md bg-[#064071] text-white"><span className="text-xs font-semibold uppercase">{new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(date)}</span><span className="mt-1 text-3xl font-semibold">{date.getUTCDate()}</span></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-primary">{appointment.reason}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[appointment.status]}`}>{appointment.status.replace('_', ' ')}</span></div><p className="mt-1 text-sm text-muted-foreground">{appointment.pet?.name ?? 'Pet'} with {appointment.practice.name}</p><p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)} at {appointment.time}</p></div></div>{isUpcoming(appointment) && <div className="flex gap-2"><button type="button" onClick={() => setRescheduling(appointment)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-[#064071]"><CalendarPlus className="size-4" />Reschedule</button><button type="button" onClick={() => setCancelling(appointment)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-red-600"><XCircle className="size-4" />Cancel</button></div>}</li>})}</ul></Card>}{cancelling && <ReasonModal appointment={cancelling} onClose={() => setCancelling(null)} onConfirm={cancel} />}{rescheduling && <RescheduleModal appointment={rescheduling} onClose={() => setRescheduling(null)} onConfirm={reschedule} />}</div>
}

function ReasonModal({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  return <Modal open onClose={onClose} title={`Cancel appointment with ${appointment.practice.name}?`} description="The practice will be notified of your reason."><form onSubmit={(event) => { event.preventDefault(); setSaving(true); void onConfirm(reason.trim()).finally(() => setSaving(false)) }}><label className="text-sm font-medium">Cancellation reason<textarea autoFocus required minLength={2} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-md border p-3 text-sm" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Keep appointment</button><button disabled={saving || reason.trim().length < 2} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Cancelling...' : 'Cancel appointment'}</button></div></form></Modal>
}

function RescheduleModal({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: (date: string, time: string) => Promise<void> }) {
  const [date, setDate] = useState(appointment.date.slice(0, 10)); const [time, setTime] = useState(appointment.time); const [saving, setSaving] = useState(false)
  return <Modal open onClose={onClose} title="Reschedule appointment" description={appointment.practice.name}><form onSubmit={(event) => { event.preventDefault(); setSaving(true); void onConfirm(date, time).finally(() => setSaving(false)) }}><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Date<input required type="date" min={minimumAppointmentDate} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3" /></label><label className="text-sm font-medium">Time<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button><button disabled={saving} className="h-10 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save new time'}</button></div></form></Modal>
}
