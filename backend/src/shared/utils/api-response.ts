import type { Response } from 'express'

export interface ApiEnvelope<T> {
  success: boolean
  data: T | null
  message: string | null
  error: {
    code: string
    details?: Record<string, string[]>
    requestId?: string
  } | null
}

export function sendSuccess<T>(response: Response, data: T, message: string | null = null, status = 200) {
  const body: ApiEnvelope<T> = { success: true, data, message, error: null }
  return response.status(status).json(body)
}

export function sendError(
  response: Response,
  status: number,
  code: string,
  message: string,
  requestId?: string,
  details?: Record<string, string[]>,
) {
  const error: NonNullable<ApiEnvelope<never>['error']> = { code }
  if (details) error.details = details
  if (requestId) error.requestId = requestId

  const body: ApiEnvelope<never> = { success: false, data: null, message, error }
  return response.status(status).json(body)
}
