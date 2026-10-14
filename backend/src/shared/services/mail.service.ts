import { env } from '../../config/env.js'
import { ApiError } from '../utils/api-error.js'

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

    if (!env.RESEND_API_KEY) {
      console.error('[mail] RESEND_API_KEY is not configured')
      throw new ApiError(503, 'MAIL_UNAVAILABLE', 'Email delivery is temporarily unavailable. Please try again later.')
    }

    let response: Response
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: env.MAIL_FROM, to: [message.to], subject: message.subject, text: message.text }),
        signal: AbortSignal.timeout(15_000),
      })
    } catch {
      console.error('[mail] Resend request failed or timed out')
      throw new ApiError(503, 'MAIL_UNAVAILABLE', 'Email delivery is temporarily unavailable. Please try again later.')
    }

    if (!response.ok) {
      console.error(`[mail] Resend rejected email with HTTP ${response.status}; check Resend API logs and sender configuration`)
      throw new ApiError(503, 'MAIL_UNAVAILABLE', 'Email delivery is temporarily unavailable. Please try again later.')
    }
  }
}

export const mailService = new MailService()
