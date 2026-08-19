import { EventEmitter } from 'node:events'
import type { Prisma, Notification } from '../../generated/prisma/client.js'
import type { NotificationCategory } from '../../generated/prisma/enums.js'

export const notificationEvents = new EventEmitter()

export interface NotificationInput {
  userId: string
  category: NotificationCategory
  title: string
  message: string
  actionUrl?: string
}

export function createNotification(transaction: Prisma.TransactionClient, input: NotificationInput) {
  return transaction.notification.create({ data: input })
}

export function emitNotifications(notifications: Notification[]) {
  for (const notification of notifications) notificationEvents.emit('notification', notification)
}
