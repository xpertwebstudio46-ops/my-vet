export type WeeklyHour = {
  day: string
  open: boolean
  start: string
  end: string
}

export type EmergencyOption = {
  id: string
  label: string
  enabled: boolean
}

export type HolidayHour = {
  id: string
  name: string
  detail: string
}
