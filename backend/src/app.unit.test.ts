import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from './app.js'

describe('application foundation', () => {
  it('returns the global envelope from health', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ success: true, error: null, data: { status: 'ok' } })
  })

  it('keeps the Stripe webhook body raw before JSON parsing', async () => {
    const response = await request(app)
      .post('/api/subscriptions/webhook')
      .set('content-type', 'application/json')
      .send('{"id":"evt_test"}')
    expect(response.status).toBe(503)
    expect(response.body.error.code).toBe('STRIPE_NOT_CONFIGURED')
  })
})
