export type VetNotificationCategory =
  | 'Appointments'
  | 'Enquiries'
  | 'Reviews'
  | 'Reminders'

export type VetNotification = {
  id: string
  title: string
  body: string
  time: string
  category: VetNotificationCategory
  unread: boolean
}
