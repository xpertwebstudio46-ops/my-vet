import type Stripe from 'stripe'
import { Prisma } from '../../generated/prisma/client.js'
import type { Notification, SubscriptionStatus } from '../../generated/prisma/client.js'
import type { Prisma as PrismaTypes } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { createNotification, emitNotifications } from '../../shared/services/notification.service.js'

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
  const planId = subscription.metadata.planId
  const existing = await transaction.subscription.findFirst({
    where: { OR: [{ stripeSubscriptionId: subscription.id }, ...(practiceId ? [{ practiceId }] : [])] },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!existing && (!practiceId || !planId)) return []
  const targetPracticeId = existing?.practiceId ?? practiceId!
  const targetPlanId = planId || existing!.planId
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
    actionUrl: '/vet/subscription',
  })
  return [notification]
}

async function applyInvoice(transaction: PrismaTypes.TransactionClient, invoice: Stripe.Invoice, paid: boolean) {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription
  const subscriptionId = stripeId(subscriptionReference)
  if (!subscriptionId) return []
  const local = await transaction.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { practice: { select: { ownerId: true } } },
  })
  if (!local) return []

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
    actionUrl: '/vet/subscription',
  })
  return [notification]
}

async function applyCheckout(transaction: PrismaTypes.TransactionClient, session: Stripe.Checkout.Session) {
  if (session.metadata?.kind !== 'featured_listing' || !session.metadata.listingId) return []
  const listing = await transaction.featuredListing.findUnique({
    where: { id: session.metadata.listingId },
    include: { plan: true, practice: { select: { ownerId: true } } },
  })
  if (!listing) return []
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
    actionUrl: '/vet/featured-listing',
  })
  return [notification]
}

export async function processStripeEvent(event: Stripe.Event) {
  let notifications: Notification[] = []
  try {
    notifications = await prisma.$transaction(async (transaction) => {
      await transaction.processedStripeEvent.create({ data: { id: event.id, type: event.type } })
      switch (event.type) {
        case 'checkout.session.completed':
          return applyCheckout(transaction, event.data.object)
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          return applySubscription(transaction, event.data.object)
        case 'invoice.paid':
          return applyInvoice(transaction, event.data.object, true)
        case 'invoice.payment_failed':
          return applyInvoice(transaction, event.data.object, false)
        default:
          return []
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { duplicate: true }
    throw error
  }
  emitNotifications(notifications)
  return { duplicate: false }
}
