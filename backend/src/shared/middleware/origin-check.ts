import type { NextFunction, Request, Response } from 'express'
import { frontendOrigins } from '../../config/env.js'
import { ApiError } from '../utils/api-error.js'

export function requireTrustedOrigin(request: Request, _response: Response, next: NextFunction) {
  const origin = request.get('origin')?.replace(/\/$/, '')
  if (!origin || !frontendOrigins.includes(origin)) {
    next(new ApiError(403, 'UNTRUSTED_ORIGIN', 'Request origin is not allowed'))
    return
  }
  next()
}
