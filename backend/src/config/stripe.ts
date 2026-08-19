import Stripe from 'stripe'
import { env } from './env.js'
import { ApiError } from '../shared/utils/api-error.js'

let stripeClient: Stripe | undefined

export function getStripe(): Stripe {
  if (!env.STRIPE_ENABLED || !env.STRIPE_SECRET_KEY) {
    throw new ApiError(503, 'STRIPE_NOT_CONFIGURED', 'Payments are not configured')
  }

  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY)
  return stripeClient
}
