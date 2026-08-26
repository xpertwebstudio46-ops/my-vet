import type Stripe from 'stripe'
import { Prisma } from '../../generated/prisma/client.js'
import type { SubscriptionPlan } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'
import { getStripe } from '../../config/stripe.js'
import { ApiError } from '../../shared/utils/api-error.js'

export const STRIPE_APP = 'my-vet'

const defaultPlans = [
  {
    name: 'Basic',
    slug: 'basic',
    description: 'Perfect for getting your practice on the map.',
    price: '9.00',
    sortOrder: 10,
    features: ['Basic practice info', 'Location visibility', 'Limited search ranking'],
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Everything you need to build trust and attract clients.',
    price: '29.00',
    sortOrder: 20,
    features: ['Full profile page', 'Services & pricing display', 'Customer reviews', 'Analytics dashboard'],
  },
  {
    name: 'Premium',
    slug: 'premium',
    description: 'Maximise your visibility and grow your practice faster.',
    price: '59.00',
    sortOrder: 30,
    features: ['Featured placement', 'Unlimited media uploads', 'Advanced analytics'],
  },
] as const

function stripeErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  return typeof error.code === 'string' ? error.code : undefined
}

function priceProductId(price: Stripe.Price) {
  return typeof price.product === 'string' ? price.product : price.product.id
}

function unitAmount(plan: SubscriptionPlan) {
  const amount = Number(plan.price.times(100).toString())
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new ApiError(400, 'INVALID_SUBSCRIPTION_PRICE', 'Subscription prices must be positive and use whole minor currency units')
  }
  return amount
}

function lookupKey(plan: SubscriptionPlan) {
  return `myvet_${plan.id}_monthly`
}

function ownsPrice(price: Stripe.Price, plan: SubscriptionPlan) {
  return price.metadata.app === STRIPE_APP && price.metadata.planId === plan.id
}

function matchingPrice(price: Stripe.Price, plan: SubscriptionPlan, productId: string, amount: number) {
  return (
    priceProductId(price) === productId &&
    price.currency === plan.currency.toLowerCase() &&
    price.unit_amount === amount &&
    price.recurring?.interval === 'month' &&
    price.recurring.interval_count === 1 &&
    price.tax_behavior === 'inclusive'
  )
}

async function ensureProduct(plan: SubscriptionPlan) {
  const stripe = getStripe()
  const productId = plan.stripeProductId ?? `prod_myvet_${plan.id}`

  try {
    await stripe.products.retrieve(productId)
  } catch (error) {
    if (stripeErrorCode(error) !== 'resource_missing') throw error
    try {
      await stripe.products.create(
        {
          id: productId,
          name: `My Vet - ${plan.name}`,
          description: plan.description ?? undefined,
          active: plan.active,
          statement_descriptor: 'MY VET',
          metadata: { app: STRIPE_APP, entity: 'subscription_plan', planId: plan.id, slug: plan.slug },
        },
        { idempotencyKey: `myvet-product-${plan.id}` },
      )
    } catch (createError) {
      if (stripeErrorCode(createError) !== 'resource_already_exists') throw createError
    }
  }

  return stripe.products.update(productId, {
    name: `My Vet - ${plan.name}`,
    description: plan.description ?? '',
    active: plan.active,
    statement_descriptor: 'MY VET',
    metadata: { app: STRIPE_APP, entity: 'subscription_plan', planId: plan.id, slug: plan.slug },
  })
}

async function existingPrice(plan: SubscriptionPlan) {
  const stripe = getStripe()
  if (plan.stripePriceId) {
    try {
      return await stripe.prices.retrieve(plan.stripePriceId)
    } catch (error) {
      if (stripeErrorCode(error) !== 'resource_missing') throw error
    }
  }

  const prices = await stripe.prices.list({ lookup_keys: [lookupKey(plan)], limit: 1 })
  return prices.data[0]
}

export async function syncSubscriptionPlan(planId: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new ApiError(404, 'SUBSCRIPTION_PLAN_NOT_FOUND', 'Subscription plan was not found')
  if (plan.billingPeriod !== 'MONTHLY') {
    throw new ApiError(400, 'UNSUPPORTED_BILLING_PERIOD', 'Only monthly subscription plans are supported right now')
  }

  const stripe = getStripe()
  const amount = unitAmount(plan)
  const product = await ensureProduct(plan)
  const previous = await existingPrice(plan)
  let price = previous

  if (!price || !matchingPrice(price, plan, product.id, amount)) {
    const fingerprint = `${plan.currency.toLowerCase()}-${amount}-month-inclusive`
    price = await stripe.prices.create(
      {
        product: product.id,
        currency: plan.currency.toLowerCase(),
        unit_amount: amount,
        recurring: { interval: 'month', interval_count: 1 },
        tax_behavior: 'inclusive',
        active: true,
        lookup_key: lookupKey(plan),
        transfer_lookup_key: true,
        nickname: `My Vet ${plan.name} monthly (VAT inclusive)`,
        metadata: { app: STRIPE_APP, entity: 'subscription_plan_price', planId: plan.id, slug: plan.slug },
      },
      { idempotencyKey: `myvet-price-${plan.id}-${fingerprint}` },
    )
  } else {
    price = await stripe.prices.update(price.id, {
      active: true,
      lookup_key: lookupKey(plan),
      transfer_lookup_key: true,
      metadata: { app: STRIPE_APP, entity: 'subscription_plan_price', planId: plan.id, slug: plan.slug },
    })
  }

  await stripe.products.update(product.id, { default_price: price.id })
  if (previous && previous.id !== price.id && ownsPrice(previous, plan) && previous.active) {
    await stripe.prices.update(previous.id, { active: false })
  }

  return prisma.subscriptionPlan.update({
    where: { id: plan.id },
    data: { stripeProductId: product.id, stripePriceId: price.id },
  })
}

export async function installAndSyncSubscriptionCatalog() {
  for (const plan of defaultPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: new Prisma.Decimal(plan.price),
        currency: 'GBP',
        billingPeriod: 'MONTHLY',
        features: { items: [...plan.features] },
        active: true,
        sortOrder: plan.sortOrder,
      },
    })
  }

  await prisma.subscriptionPlan.updateMany({ where: { slug: 'free', price: 0 }, data: { active: false } })
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true, billingPeriod: 'MONTHLY', price: { gt: 0 } },
    orderBy: { sortOrder: 'asc' },
  })

  const synced = []
  for (const plan of plans) synced.push(await syncSubscriptionPlan(plan.id))
  return synced
}
