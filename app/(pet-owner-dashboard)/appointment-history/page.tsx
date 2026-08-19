'use client'

import { useState } from 'react'
import { CalendarClock, CalendarPlus, XCircle } from 'lucide-react'
import { appointments, type Appointment } from '@/lib/dashboard-data'
import { Card } from '@/components/dashboard/ui'
import { EmptyState } from '@/components/dashboard/feedback'

const statusStyles: Record<Appointment['status'], string> = {
  Confirmed: 'bg-[#EEF7F5] text-[#01AEAD]',
  Pending: 'bg-[#FEF3C7] text-[#92400E]',
  Completed: 'bg-[#F1F5F9] text-[#475569]',
  Cancelled: 'bg-red-50 text-red-600',
}

export default function AppointmentHistoryPage() {
  const [items, setItems] = useState(appointments)
  const [activeTab, setActiveTab] = useState<Appointment['type']>('Upcoming')
  const upcomingCount = items.filter((item) => item.type === 'Upcoming').length
  const previousCount = items.filter((item) => item.type === 'Previous').length
  const filteredItems = items.filter((item) => item.type === activeTab)

  function updateStatus(id: string, status: Appointment['status']) {
    setItems((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-6 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">
            Appointment History
          </h1>
          <p className="dashboard-font max-w-2xl text-[16px] font-normal text-muted-foreground">
            Track upcoming and past appointments for your pets.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-medium text-white transition-colors hover:bg-[#05365f]"
        >
          <CalendarPlus className="size-4" />
       
          Book appointment
        </button>
      </div>

      <div className="mb-6 flex gap-2 rounded-md border border-gray-200 bg-white p-2 shadow-lg shadow-black/10">
        {[
          { label: 'Upcoming', value: 'Upcoming' as const, count: upcomingCount },
          { label: 'Previous', value: 'Previous' as const, count: previousCount },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`dashboard-font flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-[#EEF7F5] text-[#01AEAD]'
                : 'bg-white text-muted-foreground hover:bg-[#F1F5F9]'
            }`}
          >
            {tab.label}
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-[#064071] shadow-sm">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No appointments yet"
          description="Scheduled appointments will appear here once a practice confirms your booking."
        />
      ) : (
        <Card className="p-2 sm:p-3">
          <ul className="divide-y divide-border">
            {filteredItems.map((appointment) => {
              const date = getAppointmentDateParts(appointment.date)

              return (
                <li
                  key={appointment.id}
                  className="flex flex-col gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-md bg-[#064071] text-white">
                      <span className="dashboard-font text-[12px] font-semibold uppercase leading-none">
                        {date.weekday}
                      </span>
                      <span className="dashboard-outfit mt-1 text-[28px] font-semibold leading-none">
                        {date.day}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="dashboard-outfit text-[16px] font-semibold text-primary">
                          {appointment.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${statusStyles[appointment.status]}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="dashboard-font mt-1 text-sm text-muted-foreground">
                        {appointment.petName} with {appointment.practice}
                      </p>
                      <p className="dashboard-font mt-1 text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => updateStatus(appointment.id, 'Pending')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-400/30 bg-white px-3 py-2 text-sm font-medium text-[#064071] transition-colors hover:bg-[#F1F5F9]"
                    >
                      <CalendarPlus className="size-4" />
                      Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(appointment.id, 'Cancelled')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-400/30 bg-white px-3 py-2 text-sm font-medium text-[#064071] transition-colors hover:bg-[#F1F5F9]"
                    >
                      <XCircle className="size-4" />
                      Cancel
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}

function getAppointmentDateParts(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    const [day = ''] = value.split(' ')
    return { weekday: 'Date', day }
  }

  return {
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' })
      .format(date)
      .toUpperCase(),
    day: new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date),
  }
}
