import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { getStripe } from '../../config/stripe.js'
import { authenticate, requireRole } from '../auth/auth.middleware.js'
import { validateBody } from '../../shared/middleware/validate.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { sendSuccess } from '../../shared/utils/api-response.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import { getOwnedPractice } from '../vet/helpers.js'

const checkoutSchema = z.object({ planId: z.string().min(1), successUrl: z.url(), cancelUrl: z.url() })

export const subscriptionsRouter = Router()

subscriptionsRouter.get('/plans', async (_request, response) => {
  const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] })
  sendSuccess(response, plans.map((plan) => ({ ...plan, price: plan.price.toString() })))
})

subscriptionsRouter.use(authenticate, requireRole('VET'))

subscriptionsRouter.post('/checkout', validateBody(checkoutSchema), async (request, response) => {
  const practice = await getOwnedPractice(request.user!.userId)
  const body = request.validatedBody as z.infer<typeof checkoutSchema>
  const plan = await prisma.subscriptionPlan.findFirst({ where: { id: body.planId, active: true } })
  if (!plan) throw new ApiError(404, 'SUBSCRIPTION_PLAN_NOT_FOUND', 'Subscription plan was not found')

  if (plan.price.isZero()) {
    const result = await prisma.$transaction(async (transaction) => {
      const subscription = await transaction.subscription.upsert({
        where: { practiceId: practice.id },
        update: { planId: plan.id, status: 'FREE', stripeSubscriptionId: null, currentPeriodStart: null, currentPeriodEnd: null },
        create: { practiceId: practice.id, planId: plan.id, status: 'FREE' },
      })
      const notification = await createNotification(transaction, {
        userId: practice.ownerId,
        category: 'SUBSCRIPTION',
        title: 'Plan activated',
        message: `${plan.name} is now active`,
        actionUrl: '/vet/subscription',
      })
      return { subscription, notification }
    })
    emitNotifications([result.notification])
    sendSuccess(response, { subscription: result.subscription, checkoutUrl: null }, 'Plan activated')
    return
  }
  if (!plan.stripePriceId) throw new ApiError(400, 'SUBSCRIPTION_PLAN_UNAVAILABLE', 'This plan is not available for checkout')

  let customerId = practice.stripeCustomerId
  if (!customerId) {
    const customer = await getStripe().customers.create(
      { email: practice.email, name: practice.name, metadata: { practiceId: practice.id } },
      { idempotencyKey: `practice-customer-${practice.id}` },
    )
    customerId = customer.id
    await prisma.practice.update({ where: { id: practice.id }, data: { stripeCustomerId: customer.id } })
  }

  const session = await getStripe().checkout.sessions.create(
    {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      client_reference_id: practice.id,
      metadata: { kind: 'subscription', practiceId: practice.id, planId: plan.id },
      subscription_data: { metadata: { practiceId: practice.id, planId: plan.id } },
    },
    { idempotencyKey: `subscription-checkout-${practice.id}-${plan.id}` },
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
