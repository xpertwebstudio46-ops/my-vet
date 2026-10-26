import type { ErrorRequestHandler } from 'express'
import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { validateBody } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { registerSchema } from './auth.validation.js'

function registrationApp() {
  const app = express()
  const createAccount = vi.fn()
  app.use(express.json())
  app.post('/api/auth/register', validateBody(registerSchema), (req, res) => {
    createAccount(req.validatedBody)
    res.status(201).json(req.validatedBody)
  })
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (!(error instanceof ApiError)) throw error
    res.status(error.statusCode).json({ code: error.code, details: error.details })
  }
  app.use(errors)
  return { app, createAccount }
}

const valid = { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'SecurePass123' }

describe('registration backend validation', () => {
  for (const role of ['VET', 'PET_OWNER'] as const) {
    it.each([
      ['firstName', ' '],
      ['lastName', ''],
      ['email', 'invalid-email'],
      ['password', 'short'],
      ['password', 'alllowercase123'],
      ['password', 'ALLUPPERCASE123'],
      ['password', 'MissingNumbers'],
    ])(`blocks ${role} account creation for invalid %s (%s)`, async (field, value) => {
      const { app, createAccount } = registrationApp()
      const response = await request(app).post('/api/auth/register').send({ ...valid, role, [field]: value })
      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.details[field]).toBeDefined()
      expect(createAccount).not.toHaveBeenCalled()
    })
  }

  it('validates each submission when the role changes VET to PET_OWNER and back', async () => {
    const { app, createAccount } = registrationApp()
    for (const role of ['VET', 'PET_OWNER', 'VET']) {
      const response = await request(app).post('/api/auth/register').send({ ...valid, role, password: 'weak' })
      expect(response.status).toBe(400)
    }
    expect(createAccount).not.toHaveBeenCalled()
    const response = await request(app).post('/api/auth/register').send({ ...valid, role: 'VET' })
    expect(response.status).toBe(201)
    expect(createAccount).toHaveBeenCalledExactlyOnceWith({ ...valid, role: 'VET' })
  })

  it('rejects a manipulated account role', async () => {
    const { app, createAccount } = registrationApp()
    const response = await request(app).post('/api/auth/register').send({ ...valid, role: 'ADMIN' })
    expect(response.status).toBe(400)
    expect(createAccount).not.toHaveBeenCalled()
  })
})
