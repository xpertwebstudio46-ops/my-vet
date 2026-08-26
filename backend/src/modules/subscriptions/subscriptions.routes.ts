import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { getStripe } from '../../config/stripe.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateBody } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { frontendReturnUrl } from '../../shared/utils/frontend-url.js'
import { getOwnedPractice } from '../vet/helpers.js'
import { STRIPE_APP } from './stripe-catalog.service.js'

const checkoutSchema = z.object({ planId: z.string().min(1) })

export const subscriptionsRouter = Router()

subscriptionsRouter.get('/plans', async (_request, response) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true, billingPeriod: 'MONTHLY', price: { gt: 0 } },
    orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  })
  sendSuccess(response, plans.map((plan) => ({ ...plan, price: plan.price.toString() })))
})

subscriptionsRouter.use(authenticate, requireRole('VET'))

subscriptionsRouter.post('/checkout', validateBody(checkoutSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const body = request.validatedBody as z.infer<typeof checkoutSchema>
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: body.planId, active: true, billingPeriod: 'MONTHLY', price: { gt: 0 } },
  })
  if (!plan) throw new ApiError(404, 'SUBSCRIPTION_PLAN_NOT_FOUND', 'Subscription plan was not found')
  if (plan.price.isZero() || !plan.stripePriceId) {
    throw new ApiError(400, 'SUBSCRIPTION_PLAN_UNAVAILABLE', 'This plan is not available for checkout')
  }

  const localSubscription = await prisma.subscription.findUnique({
    where: { practiceId: practice.id },
    include: { plan: true },
  })
  if (localSubscription?.planId === plan.id && localSubscription.status !== 'CANCELLED') {
    throw new ApiError(409, 'SUBSCRIPTION_PLAN_ALREADY_ACTIVE', 'This is already your current plan')
  }

  if (localSubscription?.stripeSubscriptionId) {
    const stripeSubscription = await getStripe().subscriptions.retrieve(localSubscription.stripeSubscriptionId)
    if (stripeSubscription.status !== 'canceled') {
      if (!['active', 'trialing'].includes(stripeSubscription.status)) {
        throw new ApiError(409, 'SUBSCRIPTION_NOT_CHANGEABLE', 'Resolve the current subscription payment status before changing plan')
      }
      if (localSubscription.cancelAtPeriodEnd || stripeSubscription.cancel_at_period_end) {
        throw new ApiError(409, 'SUBSCRIPTION_CANCELLATION_SCHEDULED', 'Resume the subscription before changing plan')
      }
      if (plan.price.lessThanOrEqualTo(localSubscription.plan.price)) {
        throw new ApiError(409, 'SUBSCRIPTION_DOWNGRADE_UNAVAILABLE', 'Only upgrades are available in the dashboard right now')
      }
      const item = stripeSubscription.items.data[0]
      if (!item || stripeSubscription.items.data.length !== 1) {
        throw new ApiError(409, 'SUBSCRIPTION_ITEMS_INVALID', 'This subscription cannot be changed automatically')
      }

      const updated = await getStripe().subscriptions.update(
        stripeSubscription.id,
        {
          items: [{ id: item.id, price: plan.stripePriceId }],
          payment_behavior: 'pending_if_incomplete',
          proration_behavior: 'always_invoice',
        },
        { idempotencyKey: `myvet-subscription-upgrade-${stripeSubscription.id}-${plan.id}` },
      )
      if (updated.pending_update) {
        throw new ApiError(
          402,
          'SUBSCRIPTION_UPGRADE_PAYMENT_INCOMPLETE',
          'The upgrade payment needs attention before the new plan can be activated',
        )
      }
      sendSuccess(response, { checkoutUrl: null, change: 'upgraded' }, 'Subscription upgraded')
      return
    }
  }

  let customerId = practice.stripeCustomerId
  if (!customerId) {
    const customer = await getStripe().customers.create(
      { email: practice.email, name: practice.name, metadata: { app: STRIPE_APP, practiceId: practice.id } },
      { idempotencyKey: `myvet-practice-customer-${practice.id}` },
    )
    customerId = customer.id
    await prisma.practice.update({ where: { id: practice.id }, data: { stripeCustomerId: customer.id } })
  }

  const session = await getStripe().checkout.sessions.create(
    {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: frontendReturnUrl(request, '/vet-dashboard/subscription', 'success'),
      cancel_url: frontendReturnUrl(request, '/vet-dashboard/subscription', 'cancelled'),
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_update: { address: 'auto', name: 'auto' },
      client_reference_id: practice.id,
      metadata: { app: STRIPE_APP, kind: 'subscription', practiceId: practice.id, planId: plan.id },
      subscription_data: { metadata: { app: STRIPE_APP, practiceId: practice.id, planId: plan.id } },
    },
    { idempotencyKey: `myvet-subscription-checkout-${practice.id}-${plan.id}` },
  )
  sendSuccess(response, { checkoutUrl: session.url }, 'Checkout created', 201)
})

subscriptionsRouter.get('/me', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const subscription = await prisma.subscription.findUnique({
    where: { practiceId: practice.id },
    include: { plan: true, invoices: { orderBy: { paidAt: 'desc' }, take: 20 } },
  })
  sendSuccess(
    response,
    subscription
      ? {
          ...subscription,
          plan: { ...subscription.plan, price: subscription.plan.price.toString() },
          invoices: subscription.invoices.map((invoice) => ({ ...invoice, amountPaid: invoice.amountPaid.toString() })),
        }
      : null,
  )
})

subscriptionsRouter.post('/cancel', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const subscription = await prisma.subscription.findUnique({ where: { practiceId: practice.id } })
  if (!subscription?.stripeSubscriptionId) {
    throw new ApiError(400, 'PAID_SUBSCRIPTION_NOT_FOUND', 'No paid subscription is available to cancel')
  }
  const updated = await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true })
  const currentPeriodEnd = updated.items.data.length
    ? new Date(Math.max(...updated.items.data.map((item) => item.current_period_end)) * 1_000)
    : null
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true, currentPeriodEnd },
  })
  sendSuccess(response, { cancelAtPeriodEnd: true, effectiveAt: currentPeriodEnd }, 'Subscription will cancel at period end')
})

subscriptionsRouter.post('/resume', async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const subscription = await prisma.subscription.findUnique({ where: { practiceId: practice.id } })
  if (!subscription?.stripeSubscriptionId || !subscription.cancelAtPeriodEnd) {
    throw new ApiError(400, 'SCHEDULED_CANCELLATION_NOT_FOUND', 'No scheduled subscription cancellation is available to resume')
  }

  const updated = await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: false })
  if (updated.status === 'canceled') {
    throw new ApiError(409, 'SUBSCRIPTION_ALREADY_CANCELLED', 'This subscription has already ended and cannot be resumed')
  }
  await prisma.subscription.update({ where: { id: subscription.id }, data: { cancelAtPeriodEnd: false, cancelledAt: null } })
  sendSuccess(response, { cancelAtPeriodEnd: false }, 'Subscription cancellation removed')
})
