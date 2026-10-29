export interface EmergencyDay {
  dayOfWeek: number
  isClosed: boolean
  is24Hours: boolean
  opensAt: string | null
  closesAt: string | null
}
export const emergencyDayOrder = [1, 2, 3, 4, 5, 6, 0]
export const emergencyDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export function emptyEmergencyWeek(): EmergencyDay[] {
  return emergencyDayOrder.map((dayOfWeek) => ({ dayOfWeek, isClosed: true, is24Hours: false, opensAt: null, closesAt: null }))
}
export function emergencyTimeLabel(day: EmergencyDay) {
  if (day.isClosed) return 'Unavailable'
  if (day.is24Hours) return '24 hours'
  if (!day.opensAt || !day.closesAt) return 'Contact practice'
  return `${day.opensAt} – ${day.closesAt}${day.closesAt < day.opensAt ? ' (next day)' : ''}`
}
