import { rateLimit } from 'express-rate-limit'
import { sendError } from '../utils/api-response.js'

function limiter(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (request, response) =>
      sendError(response, 429, 'RATE_LIMITED', 'Too many requests, please try again later', request.requestId),
  })
}

export const generalRateLimiter = limiter(15 * 60_000, 500)
export const authRateLimiter = limiter(15 * 60_000, 20)
export const passwordResetRateLimiter = limiter(60 * 60_000, 5)
export const reviewRateLimiter = limiter(60 * 60_000, 20)
export const uploadRateLimiter = limiter(15 * 60_000, 30)
export const contactRateLimiter = limiter(60 * 60_000, 10)
export const analyticsWriteRateLimiter = limiter(60_000, 60)
