'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, CreditCard } from 'lucide-react'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Plan = {
  id: string
  name: string
  description: string | null
  price: string
  currency: string
  billingPeriod: 'MONTHLY' | 'YEARLY'
  features: unknown
}

type Invoice = {
  id: string
  amountPaid: string
  currency: string
  paidAt: string
  periodStart: string | null
  periodEnd: string | null
}

type Subscription = {
  id: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  plan: Plan
  invoices: Invoice[]
}

function money(value: string, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(value))
}

function featureList(features: unknown): string[] {
  if (Array.isArray(features)) return features.filter((item): item is string => typeof item === 'string')
  if (features && typeof features === 'object' && 'items' in features) {
    const items = (features as { items?: unknown }).items
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : []
  }
  return []
}

export function VetSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [availablePlans, current] = await Promise.all([
        apiClient<Plan[]>('/api/subscriptions/plans', {}, { authenticated: false }),
        apiClient<Subscription | null>('/api/subscriptions/me'),
      ])
      setPlans(availablePlans)
      setSubscription(current)
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Subscription details could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.all([
      apiClient<Plan[]>('/api/subscriptions/plans', {}, { authenticated: false }),
      apiClient<Subscription | null>('/api/subscriptions/me'),
    ]).then(([availablePlans, current]) => {
      setPlans(availablePlans)
      setSubscription(current)
    }).catch((caught) => {
      setError(caught instanceof ApiClientError ? caught.message : 'Subscription details could not be loaded.')
    }).finally(() => setLoading(false))
  }, [])

  async function choosePlan(plan: Plan) {
    setBusy(plan.id)
    setError('')
    setMessage('')
    try {
      const returnUrl = `${window.location.origin}/vet-dashboard/subscription`
      const result = await apiClient<{ checkoutUrl: string | null }>(
        '/api/subscriptions/checkout',
        { method: 'POST', body: JSON.stringify({ planId: plan.id, successUrl: `${returnUrl}?checkout=success`, cancelUrl: `${returnUrl}?checkout=cancelled` }) },
      )
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
        return
      }
      setMessage(`${plan.name} is now active.`)
      await load()
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Checkout could not be started.')
    } finally {
      setBusy(null)
    }
  }

  async function cancelSubscription() {
    if (!window.confirm('Cancel this subscription at the end of its billing period?')) return
    setBusy('cancel')
    setError('')
    try {
      await apiClient('/api/subscriptions/cancel', { method: 'POST' })
      setMessage('Your subscription will end after the current billing period.')
      await load()
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'The subscription could not be cancelled.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" description="Manage your practice plan, billing status and payment history." />
      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <Card className="p-6 text-sm text-muted-foreground">Loading subscription details…</Card> : (
        <>
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#01AEAD]">Current plan</p>
                <h2 className="mt-1 text-2xl font-semibold text-black">{subscription?.plan.name ?? 'No active plan'}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {subscription ? `${subscription.status.replaceAll('_', ' ')}${subscription.currentPeriodEnd ? ` · Current period ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')}` : ''}` : 'Choose a plan below to activate subscription features.'}
                </p>
                {subscription?.cancelAtPeriodEnd && <p className="mt-2 text-sm font-medium text-amber-700">Cancellation is scheduled for the end of this period.</p>}
              </div>
              {subscription?.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
                <button type="button" disabled={busy === 'cancel'} onClick={() => void cancelSubscription()} className="h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-600 disabled:opacity-50">
                  {busy === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
                </button>
              )}
            </div>
          </Card>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-black">Available plans</h2>
            {plans.length === 0 ? <Card className="p-6 text-sm text-muted-foreground">No subscription plans are currently available.</Card> : (
              <div className="grid gap-5 lg:grid-cols-3">
                {plans.map((plan) => {
                  const current = subscription?.plan.id === plan.id
                  return <Card key={plan.id} className={current ? 'border-[#01AEAD] p-6 ring-1 ring-[#01AEAD]' : 'p-6'}>
                    <h3 className="text-lg font-semibold text-black">{plan.name}</h3>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.description ?? 'Practice subscription plan'}</p>
                    <p className="mt-5 text-3xl font-semibold text-[#064071]">{money(plan.price, plan.currency)}<span className="text-sm font-normal text-muted-foreground">/{plan.billingPeriod === 'YEARLY' ? 'year' : 'month'}</span></p>
                    <ul className="mt-5 space-y-2 text-sm">{featureList(plan.features).map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#01AEAD]" />{feature}</li>)}</ul>
                    <button type="button" disabled={current || busy !== null} onClick={() => void choosePlan(plan)} className="mt-6 h-10 w-full rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:bg-slate-300">
                      {current ? 'Current plan' : busy === plan.id ? 'Starting…' : Number(plan.price) === 0 ? 'Activate plan' : 'Choose plan'}
                    </button>
                  </Card>
                })}
              </div>
            )}
          </section>

          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b p-5"><CreditCard className="size-5 text-[#01AEAD]" /><h2 className="font-semibold text-black">Billing history</h2></div>
            {!subscription?.invoices.length ? <p className="p-6 text-sm text-muted-foreground">No paid invoices yet.</p> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="px-5 py-3">Paid</th><th className="px-5 py-3">Period</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody>{subscription.invoices.map((invoice) => <tr key={invoice.id} className="border-t"><td className="px-5 py-4">{new Date(invoice.paidAt).toLocaleDateString('en-GB')}</td><td className="px-5 py-4 text-muted-foreground">{invoice.periodStart ? new Date(invoice.periodStart).toLocaleDateString('en-GB') : '—'} – {invoice.periodEnd ? new Date(invoice.periodEnd).toLocaleDateString('en-GB') : '—'}</td><td className="px-5 py-4 text-right font-semibold">{money(invoice.amountPaid, invoice.currency.toUpperCase())}</td></tr>)}</tbody></table></div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
