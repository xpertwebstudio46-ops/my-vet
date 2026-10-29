export const calloutDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const calloutDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export interface CalloutArea {
  id: string
  location: string
  description: string | null
  postcodes: string[]
  days: number[]
  standardMin: string
  standardMax: string
  reducedMin: string
  reducedMax: string
  active: boolean
}

const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 })
export function calloutPrice(minimum: string, maximum: string) {
  const min = Number(minimum), max = Number(maximum)
  const label = (value: number) => value === 0 ? 'Free' : pounds.format(value)
  return min === max ? label(min) : `${label(min)} – ${label(max)}`
}
