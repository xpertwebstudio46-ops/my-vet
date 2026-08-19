import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { errorHandler } from './error-handler.js'
import { requestId } from './request-id.js'
import { validateBody, validateQuery } from './validate.js'

describe('validated request middleware', () => {
  it('stores transformed body input and strips unknown keys', async () => {
    const app = express()
    app.use(express.json(), requestId)
    app.post('/', validateBody(z.object({ email: z.string().trim().toLowerCase() })), (req, res) => res.json(req.validatedBody))
    app.use(errorHandler)
    const response = await request(app).post('/').send({ email: ' Test@Example.COM ', admin: true })
    expect(response.body).toEqual({ email: 'test@example.com' })
  })

  it('does not replace Express query and returns the standard validation envelope', async () => {
    const app = express()
    app.use(requestId)
    app.get('/', validateQuery(z.object({ page: z.coerce.number().int().positive() })), (_req, res) => res.sendStatus(204))
    app.use(errorHandler)
    const response = await request(app).get('/?page=nope')
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({ success: false, data: null, error: { code: 'VALIDATION_ERROR' } })
  })
})
