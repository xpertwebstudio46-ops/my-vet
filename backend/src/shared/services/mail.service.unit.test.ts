import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const settings = vi.hoisted(() => ({ NODE_ENV: 'production', MAIL_FROM: 'no-reply@my-vet.co.uk', RESEND_API_KEY: 'test-key' as string | undefined }))
vi.mock('../../config/env.js', () => ({ env: settings }))

import { MailService } from './mail.service.js'

describe('Resend mail delivery', () => {
  const message = { to: 'recipient@example.com', subject: 'Reset password', text: 'https://my-vet.co.uk/reset-password?token=test-token' }
  const send = new MailService()

  beforeEach(() => {
    settings.NODE_ENV = 'production'
    settings.RESEND_API_KEY = 'test-key'
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('sends the sender, recipient and reset link to Resend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email-id' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await send.send(message)
    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      method: 'POST',
      headers: { Authorization: 'Bearer test-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: settings.MAIL_FROM, to: [message.to], subject: message.subject, text: message.text }),
    }))
  })

  it('fails explicitly when production has no API key', async () => {
    settings.RESEND_API_KEY = undefined
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(send.send(message)).rejects.toMatchObject({ statusCode: 503, code: 'MAIL_UNAVAILABLE' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not report success when Resend rejects the message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })))
    await expect(send.send(message)).rejects.toMatchObject({ code: 'MAIL_UNAVAILABLE' })
  })

  it('handles provider connection failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection failed')))
    await expect(send.send(message)).rejects.toMatchObject({ code: 'MAIL_UNAVAILABLE' })
  })

  it('keeps development delivery local', async () => {
    settings.NODE_ENV = 'development'
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await send.send(message)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
