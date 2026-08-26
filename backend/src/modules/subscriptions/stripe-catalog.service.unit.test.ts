import { beforeEach, describe, expect, it, vi } from 'vitest'
import type Stripe from 'stripe'
import { Prisma } from '../../generated/prisma/client.js'
import type { SubscriptionPlan } from '../../generated/prisma/client.js'

const mocks = vi.hoisted(() => ({
  planFindUnique: vi.fn(),
  planUpdate: vi.fn(),
  productRetrieve: vi.fn(),
  productCreate: vi.fn(),
  productUpdate: vi.fn(),
  priceRetrieve: vi.fn(),
  priceList: vi.fn(),
  priceCreate: vi.fn(),
  priceUpdate: vi.fn(),
}))

vi.mock('../../config/database.js', () => ({
  prisma: {
    subscriptionPlan: {
      findUnique: mocks.planFindUnique,
      update: mocks.planUpdate,
    },
  },
}))

vi.mock('../../config/stripe.js', () => ({
  getStripe: () => ({
    products: {
      retrieve: mocks.productRetrieve,
      create: mocks.productCreate,
      update: mocks.productUpdate,
    },
    prices: {
      retrieve: mocks.priceRetrieve,
      list: mocks.priceList,
      create: mocks.priceCreate,
      update: mocks.priceUpdate,
    },
  }),
}))

import { syncSubscriptionPlan } from './stripe-catalog.service.js'

function plan(overrides: Partial<SubscriptionPlan> = {}) {
  return {
    id: 'plan_1',
    name: 'Basic',
    slug: 'basic',
    description: 'Basic listing',
    price: new Prisma.Decimal(9),
    currency: 'GBP',
    billingPeriod: 'MONTHLY',
    stripeProductId: null,
    stripePriceId: null,
    features: { items: [] },
    active: true,
    sortOrder: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as SubscriptionPlan
}

function product(id = 'prod_myvet_plan_1') {
  return { id } as Stripe.Product
}

function price(id: string, amount: number, metadata: Stripe.Metadata = {}) {
  return {
    id,
    product: 'prod_myvet_plan_1',
    currency: 'gbp',
    unit_amount: amount,
    recurring: { interval: 'month', interval_count: 1 },
    tax_behavior: 'inclusive',
    active: true,
    metadata,
  } as Stripe.Price
}

describe('syncSubscriptionPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.productUpdate.mockResolvedValue(product())
    mocks.priceList.mockResolvedValue({ data: [] })
  })

  it('creates a deterministic My Vet product and VAT-inclusive monthly price', async () => {
    const current = plan()
    const createdPrice = price('price_basic', 900, { app: 'my-vet', planId: current.id })
    mocks.planFindUnique.mockResolvedValue(current)
    mocks.productRetrieve.mockRejectedValue({ code: 'resource_missing' })
    mocks.productCreate.mockResolvedValue(product())
    mocks.priceCreate.mockResolvedValue(createdPrice)
    mocks.planUpdate.mockResolvedValue({ ...current, stripeProductId: product().id, stripePriceId: createdPrice.id })

    await syncSubscriptionPlan(current.id)

    expect(mocks.productCreate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'prod_myvet_plan_1', metadata: expect.objectContaining({ app: 'my-vet', planId: current.id }) }),
      expect.any(Object),
    )
    expect(mocks.priceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        product: 'prod_myvet_plan_1',
        currency: 'gbp',
        unit_amount: 900,
        recurring: { interval: 'month', interval_count: 1 },
        tax_behavior: 'inclusive',
        metadata: expect.objectContaining({ app: 'my-vet', planId: current.id }),
      }),
      expect.any(Object),
    )
    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: current.id },
      data: { stripeProductId: 'prod_myvet_plan_1', stripePriceId: 'price_basic' },
    })
  })

  it('creates a replacement price and archives the previous My Vet price when the amount changes', async () => {
    const current = plan({ price: new Prisma.Decimal(29), stripeProductId: 'prod_myvet_plan_1', stripePriceId: 'price_old' })
    const previous = price('price_old', 900, { app: 'my-vet', planId: current.id })
    const replacement = price('price_new', 2_900, { app: 'my-vet', planId: current.id })
    mocks.planFindUnique.mockResolvedValue(current)
    mocks.productRetrieve.mockResolvedValue(product())
    mocks.priceRetrieve.mockResolvedValue(previous)
    mocks.priceCreate.mockResolvedValue(replacement)
    mocks.priceUpdate.mockResolvedValue({ ...previous, active: false })
    mocks.planUpdate.mockResolvedValue({ ...current, stripePriceId: replacement.id })

    await syncSubscriptionPlan(current.id)

    expect(mocks.priceCreate).toHaveBeenCalledWith(expect.objectContaining({ unit_amount: 2_900 }), expect.any(Object))
    expect(mocks.priceUpdate).toHaveBeenCalledWith('price_old', { active: false })
    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: current.id },
      data: { stripeProductId: 'prod_myvet_plan_1', stripePriceId: 'price_new' },
    })
  })
})
