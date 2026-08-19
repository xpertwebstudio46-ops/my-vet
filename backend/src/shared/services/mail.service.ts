import { env } from '../../config/env.js'

export interface MailMessage {
  to: string
  subject: string
  text: string
}

export class MailService {
  async send(message: MailMessage) {
    if (env.NODE_ENV !== 'production') {
      console.info(`[mail:${env.MAIL_FROM}] to=${message.to} subject=${message.subject}\n${message.text}`)
      return
    }

    // Production provider integration is intentionally isolated here. Until configured,
    // requests still remain enumeration-safe and reset tokens stay hashed in the database.
    console.warn('Mail provider is not configured; message was not delivered')
  }
}

export const mailService = new MailService()
