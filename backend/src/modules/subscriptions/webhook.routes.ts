import { Router } from 'express'
import type Stripe from 'stripe'
import { env } from '../../config/env.js'
import { getStripe } from '../../config/stripe.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendError, sendSuccess } from '../../shared/utils/api-response.js'
import { processStripeEvent } from './stripe-event.service.js'

export const webhookRouter = Router()

webhookRouter.post('/', async (request, response) => {
  if (!Buffer.isBuffer(request.body)) {
    sendError(response, 400, 'RAW_BODY_REQUIRED', 'Webhook body must be raw', request.requestId)
    return
  }
  if (!env.STRIPE_ENABLED || !env.STRIPE_WEBHOOK_SECRET) {
    sendError(response, 503, 'STRIPE_NOT_CONFIGURED', 'Stripe webhook processing is not configured', request.requestId)
    return
  }
  const signature = request.get('stripe-signature')
  if (!signature) throw new ApiError(400, 'STRIPE_SIGNATURE_REQUIRED', 'Stripe signature is required')
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(request.body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    throw new ApiError(400, 'INVALID_STRIPE_SIGNATURE', 'Stripe webhook signature is invalid')
  }
  const result = await processStripeEvent(event)
  sendSuccess(response, { received: true, duplicate: result.duplicate, ignored: result.ignored })
})
