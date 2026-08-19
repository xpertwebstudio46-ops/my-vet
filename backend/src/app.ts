import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env, frontendOrigins } from './config/env.js'
import { prisma } from './config/database.js'
import { webhookRouter } from './modules/subscriptions/webhook.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { usersRouter } from './modules/users/users.routes.js'
import { practicesRouter } from './modules/practices/practices.routes.js'
import { petsRouter } from './modules/pets/pets.routes.js'
import { notificationsRouter } from './modules/notifications/notifications.routes.js'
import { appointmentsRouter } from './modules/appointments/appointments.routes.js'
import { reviewsRouter } from './modules/reviews/reviews.routes.js'
import { vetRouter } from './modules/vet/vet.routes.js'
import { uploadRouter } from './modules/upload/upload.routes.js'
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes.js'
import { contactRouter } from './modules/contact/contact.routes.js'
import { publicContentRouter } from './modules/public-content/public-content.routes.js'
import { analyticsRouter } from './modules/analytics/analytics.routes.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { errorHandler, notFound } from './shared/middleware/error-handler.js'
import { generalRateLimiter } from './shared/middleware/rate-limiter.js'
import { requestId } from './shared/middleware/request-id.js'
import { sendError, sendSuccess } from './shared/utils/api-response.js'

export function createApp() {
  const app = express()
  app.set('trust proxy', env.TRUST_PROXY === 'false' ? false : Number(env.TRUST_PROXY) || env.TRUST_PROXY)

  app.use(requestId)
  app.use(helmet())
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || frontendOrigins.includes(origin.replace(/\/$/, ''))) callback(null, true)
        else callback(null, false)
      },
    }),
  )
  morgan.token('request-id', (request) => (request as Request).requestId ?? '-')
  app.use(morgan(':method :url :status :response-time ms request_id=:request-id'))

  app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json', limit: '1mb' }), webhookRouter)

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: false, limit: '1mb' }))
  app.use(cookieParser())
  app.use(generalRateLimiter)

  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/practices', practicesRouter)
  app.use('/api/pets', petsRouter)
  app.use('/api/notifications', notificationsRouter)
  app.use('/api/appointments', appointmentsRouter)
  app.use('/api/reviews', reviewsRouter)
  app.use('/api/vet', vetRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/subscriptions', subscriptionsRouter)
  app.use('/api/contact', contactRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api', publicContentRouter)

  app.get('/api/health', (_request, response) => {
    sendSuccess(response, { status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/api/readiness', async (request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      sendSuccess(response, { status: 'ready' })
    } catch {
      sendError(response, 503, 'NOT_READY', 'Database is unavailable', request.requestId)
    }
  })

  app.use(notFound)
  app.use(errorHandler)
  return app
}

export const app = createApp()
