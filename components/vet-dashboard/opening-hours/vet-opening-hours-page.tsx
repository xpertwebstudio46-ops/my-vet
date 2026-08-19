'use client'

import { useState } from 'react'
import { ConfirmDeleteModal } from '../team-members/confirm-delete-modal'
import { EmergencyHoursCard } from './emergency-hours-card'
import { HolidayFormModal } from './holiday-form-modal'
import { HolidayHoursCard } from './holiday-hours-card'
import { OpeningHoursBanner } from './opening-hours-banner'
import type {
  EmergencyOption,
  HolidayHour,
  WeeklyHour,
} from './opening-hours-types'
import { WeeklyHoursCard } from './weekly-hours-card'

const initialWeeklyHours: WeeklyHour[] = [
  { day: 'Monday', open: true, start: '09:00', end: '18:00' },
  { day: 'Tuesday', open: true, start: '09:00', end: '18:00' },
  { day: 'Wednesday', open: true, start: '09:00', end: '18:00' },
  { day: 'Thursday', open: true, start: '09:00', end: '18:00' },
  { day: 'Friday', open: true, start: '09:00', end: '18:00' },
  { day: 'Saturday', open: true, start: '10:00', end: '14:00' },
  { day: 'Sunday', open: false, start: '', end: '' },
]

const initialEmergencyOptions: EmergencyOption[] = [
  { id: 'twenty-four-seven', label: '24/7 emergency line', enabled: true },
  {
    id: 'overnight-hospitalisation',
    label: 'Overnight hospitalisation',
    enabled: false,
  },
  { id: 'weekend-home-visits', label: 'Weekend home visits', enabled: true },
]

const initialHolidayHours: HolidayHour[] = [
  {
    id: 'good-friday',
    name: 'Good Friday',
    detail: '03 Apr 2026 · Closed',
  },
]

export function VetOpeningHoursPage() {
  const [weeklyHours, setWeeklyHours] = useState(initialWeeklyHours)
  const [emergencyOptions, setEmergencyOptions] = useState(
    initialEmergencyOptions,
  )
  const [holidays, setHolidays] = useState(initialHolidayHours)
  const [addHolidayOpen, setAddHolidayOpen] = useState(false)
  const [deletingHoliday, setDeletingHoliday] = useState<HolidayHour | null>(
    null,
  )

  function toggleDay(day: string) {
    setWeeklyHours((current) =>
      current.map((item) =>
        item.day === day ? { ...item, open: !item.open } : item,
      ),
    )
  }

  function updateDayTime(
    day: string,
    field: 'start' | 'end',
    value: string,
  ) {
    setWeeklyHours((current) =>
      current.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    )
  }

  function toggleEmergencyOption(id: string) {
    setEmergencyOptions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <OpeningHoursBanner onSave={() => undefined} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <WeeklyHoursCard
          hours={weeklyHours}
          onToggle={toggleDay}
          onTimeChange={updateDayTime}
        />

        <div className="grid gap-5">
          <EmergencyHoursCard
            options={emergencyOptions}
            onToggle={toggleEmergencyOption}
          />
          <HolidayHoursCard
            holidays={holidays}
            onAdd={() => setAddHolidayOpen(true)}
            onDelete={setDeletingHoliday}
          />
        </div>
      </div>

      {addHolidayOpen && (
        <HolidayFormModal
          onClose={() => setAddHolidayOpen(false)}
          onAdd={(holiday) => {
            setHolidays((current) => [...current, holiday])
            setAddHolidayOpen(false)
          }}
        />
      )}

      {deletingHoliday && (
        <ConfirmDeleteModal
          title="Delete holiday hours?"
          description={`This will remove ${deletingHoliday.name} from holiday hours.`}
          onClose={() => setDeletingHoliday(null)}
          onConfirm={() => {
            setHolidays((current) =>
              current.filter((holiday) => holiday.id !== deletingHoliday.id),
            )
            setDeletingHoliday(null)
          }}
        />
      )}
    </div>
  )
}
