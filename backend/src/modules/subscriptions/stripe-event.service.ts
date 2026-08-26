import type Stripe from 'stripe'
import { Prisma } from '../../generated/prisma/client.js'
import type { Notification, SubscriptionStatus } from '../../generated/prisma/client.js'
import type { Prisma as PrismaTypes } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { getStripe } from '../../config/stripe.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'
import { STRIPE_APP } from './stripe-catalog.service.js'

type ApplicationResult = { handled: boolean; notifications: Notification[] }

const ignored: ApplicationResult = { handled: false, notifications: [] }

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id
}

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statuses: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'CANCELLED',
    unpaid: 'PAST_DUE',
    paused: 'PAST_DUE',
  }
  return statuses[status] ?? 'INCOMPLETE'
}

function subscriptionPeriod(subscription: Stripe.Subscription) {
  const starts = subscription.items.data.map((item) => item.current_period_start)
  const ends = subscription.items.data.map((item) => item.current_period_end)
  return {
    currentPeriodStart: starts.length ? new Date(Math.min(...starts) * 1_000) : null,
    currentPeriodEnd: ends.length ? new Date(Math.max(...ends) * 1_000) : null,
  }
}

async function applySubscription(transaction: PrismaTypes.TransactionClient, subscription: Stripe.Subscription) {
  const practiceId = subscription.metadata.practiceId
  const isMyVet = subscription.metadata.app === STRIPE_APP
  const existing = await transaction.subscription.findFirst({
    where: isMyVet && practiceId
      ? { OR: [{ stripeSubscriptionId: subscription.id }, { practiceId }] }
      : { stripeSubscriptionId: subscription.id },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!existing && !isMyVet) return ignored

  const priceIds = subscription.items.data.map((item) => item.price.id)
  const pricePlan = priceIds.length
    ? await transaction.subscriptionPlan.findFirst({ where: { stripePriceId: { in: priceIds } } })
    : null
  const planId = pricePlan?.id ?? subscription.metadata.planId ?? existing?.planId
  if (!existing && (!practiceId || !planId)) return ignored
  const targetPracticeId = existing?.practiceId ?? practiceId!
  const targetPlanId = planId!
  const period = subscriptionPeriod(subscription)
  const record = await transaction.subscription.upsert({
    where: { practiceId: targetPracticeId },
    update: {
      planId: targetPlanId,
      stripeSubscriptionId: subscription.id,
      status: mapStatus(subscription.status),
      ...period,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1_000) : null,
    },
    create: {
      practiceId: targetPracticeId,
      planId: targetPlanId,
      stripeSubscriptionId: subscription.id,
      status: mapStatus(subscription.status),
      ...period,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1_000) : null,
    },
    include: { practice: { select: { ownerId: true } } },
  })
  const notification = await createNotification(transaction, {
    userId: record.practice.ownerId,
    category: 'SUBSCRIPTION',
    title: 'Subscription updated',
    message: `Your subscription is now ${record.status.toLowerCase().replace('_', ' ')}`,
    actionUrl: '/vet-dashboard/subscription',
  })
  return { handled: true, notifications: [notification] }
}

async function applyInvoice(transaction: PrismaTypes.TransactionClient, invoice: Stripe.Invoice, paid: boolean) {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription
  const subscriptionId = stripeId(subscriptionReference)
  if (!subscriptionId) return ignored
  const local = await transaction.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!local) return ignored

  if (paid) {
    await transaction.subscriptionInvoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: {
        amountPaid: new Prisma.Decimal(invoice.amount_paid).dividedBy(100),
        currency: invoice.currency.toUpperCase(),
        periodStart: new Date(invoice.period_start * 1_000),
        periodEnd: new Date(invoice.period_end * 1_000),
        paidAt: new Date((invoice.status_transitions.paid_at ?? invoice.created) * 1_000),
      },
      create: {
        stripeInvoiceId: invoice.id,
        subscriptionId: local.id,
        practiceId: local.practiceId,
        amountPaid: new Prisma.Decimal(invoice.amount_paid).dividedBy(100),
        currency: invoice.currency.toUpperCase(),
        periodStart: new Date(invoice.period_start * 1_000),
        periodEnd: new Date(invoice.period_end * 1_000),
        paidAt: new Date((invoice.status_transitions.paid_at ?? invoice.created) * 1_000),
      },
    })
    await transaction.subscription.update({ where: { id: local.id }, data: { status: 'ACTIVE' } })
  } else {
    await transaction.subscription.update({ where: { id: local.id }, data: { status: 'PAST_DUE' } })
  }
  const notification = await createNotification(transaction, {
    userId: local.practice.ownerId,
    category: 'SUBSCRIPTION',
    title: paid ? 'Subscription payment received' : 'Subscription payment failed',
    message: paid ? 'Your subscription payment was successful' : 'Please update your payment method',
    actionUrl: '/vet-dashboard/subscription',
  })
  return { handled: true, notifications: [notification] }
}

async function applyCheckout(transaction: PrismaTypes.TransactionClient, session: Stripe.Checkout.Session) {
  if (session.metadata?.app !== STRIPE_APP || session.metadata.kind !== 'featured_listing' || !session.metadata.listingId) {
    return ignored
  }
  const listing = await transaction.featuredListing.findUnique({
    where: { id: session.metadata.listingId },
    include: { plan: true, practice: { select: { ownerId: true } } },
  })
  if (!listing) return ignored
  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + listing.plan.durationDays * 86_400_000)
  await transaction.featuredListing.update({
    where: { id: listing.id },
    data: {
      status: 'ACTIVE',
      startsAt,
      endsAt,
      stripePaymentIntentId: stripeId(session.payment_intent),
    },
  })
  await transaction.practice.update({ where: { id: listing.practiceId }, data: { isFeatured: true, featuredUntil: endsAt } })
  const notification = await createNotification(transaction, {
    userId: listing.practice.ownerId,
    category: 'FEATURED_LISTING',
    title: 'Featured listing activated',
    message: `Your featured listing is active until ${endsAt.toISOString().slice(0, 10)}`,
    actionUrl: '/vet-dashboard/featured-listing',
  })
  return { handled: true, notifications: [notification] }
}

export async function processStripeEvent(event: Stripe.Event) {
  const alreadyProcessed = await prisma.processedStripeEvent.findUnique({ where: { id: event.id }, select: { id: true } })
  if (alreadyProcessed) return { duplicate: true, ignored: false }

  let relatedSubscription: Stripe.Subscription | null = null
  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const reference = invoice.parent?.subscription_details?.subscription
    const subscriptionId = stripeId(reference)
    if (!subscriptionId) return { duplicate: false, ignored: true }

    const local = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId }, select: { id: true } })
    const metadata = invoice.parent?.subscription_details?.metadata
    if (!local && metadata?.app !== STRIPE_APP) return { duplicate: false, ignored: true }
    if (!local) {
      relatedSubscription = typeof reference === 'string' ? await getStripe().subscriptions.retrieve(reference) : reference ?? null
    }
  }

  let notifications: Notification[] = []
  let handled = false
  try {
    const result = await prisma.$transaction(async (transaction) => {
      let application: ApplicationResult
      switch (event.type) {
        case 'checkout.session.completed':
          application = await applyCheckout(transaction, event.data.object)
          break
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.pending_update_applied':
        case 'customer.subscription.pending_update_expired':
          application = await applySubscription(transaction, event.data.object)
          break
        case 'invoice.paid':
        case 'invoice.payment_failed':
          {
            const subscriptionApplication = relatedSubscription
              ? await applySubscription(transaction, relatedSubscription)
              : ignored
            const invoiceApplication = await applyInvoice(transaction, event.data.object, event.type === 'invoice.paid')
            application = {
              handled: invoiceApplication.handled,
              notifications: [...subscriptionApplication.notifications, ...invoiceApplication.notifications],
            }
          }
          break
        default:
          application = ignored
      }
      if (application.handled) {
        await transaction.processedStripeEvent.create({ data: { id: event.id, type: event.type } })
      }
      return application
    })
    notifications = result.notifications
    handled = result.handled
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { duplicate: true, ignored: false }
    }
    throw error
  }
  emitNotifications(notifications)
  return { duplicate: false, ignored: !handled }
}
