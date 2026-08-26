import type { Request } from 'express'
import { frontendOrigins } from '../../config/env.js'

function normalizedOrigin(value: string | undefined) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function selectFrontendOrigin(requestOrigin: string | undefined, allowedOrigins = frontendOrigins) {
  const allowed = allowedOrigins.map((origin) => normalizedOrigin(origin)).filter((origin): origin is string => Boolean(origin))
  if (!allowed.length) throw new Error('No valid frontend origin is configured')

  const requested = normalizedOrigin(requestOrigin)
  return requested && allowed.includes(requested) ? requested : allowed[0]!
}

export function frontendReturnUrl(request: Request, pathname: string, checkout: 'success' | 'cancelled') {
  const url = new URL(pathname, `${selectFrontendOrigin(request.get('origin'))}/`)
  url.searchParams.set('checkout', checkout)
  return url.toString()
}
