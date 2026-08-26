'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { AdminPageBanner } from '../shared/admin-page-banner'

type Plan = {
  id: string
  name: string
  description: string | null
  price: string
  currency: 'GBP'
  billingPeriod: 'MONTHLY'
  stripeProductId: string | null
  stripePriceId: string | null
  features: unknown
  active: boolean
  sortOrder: number
}

type Form = {
  name: string
  description: string
  price: string
  features: string
  active: boolean
  sortOrder: number
}

const empty: Form = { name: '', description: '', price: '9.00', features: '', active: true, sortOrder: 0 }

function featureText(value: unknown) {
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object' && 'items' in value && Array.isArray((value as { items: unknown }).items)) {
    return (value as { items: string[] }).items.join(', ')
  }
  return ''
}

export function SubscriptionPlanPage() {
  const [items, setItems] = useState<Plan[]>([])
  const [form, setForm] = useState<Form>(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const plans = await apiClient<Plan[]>('/api/admin/subscription-plans')
    setItems(plans)
  }, [])

  useEffect(() => {
    void apiClient<Plan[]>('/api/admin/subscription-plans')
      .then(setItems)
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Plans could not be loaded.'))
  }, [])

  async function syncStripe() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiClient('/api/admin/subscription-plans/sync-stripe', { method: 'POST' })
      await load()
      setMessage('The active monthly catalog is synced to Stripe. Missing Basic, Professional and Premium plans were added.')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'The Stripe catalog could not be synced.')
    } finally {
      setBusy(false)
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const plan = await apiClient<Plan>(
        editing ? `/api/admin/subscription-plans/${editing}` : '/api/admin/subscription-plans',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: Number(form.price),
            currency: 'GBP',
            billingPeriod: 'MONTHLY',
            features: { items: form.features.split(',').map((item) => item.trim()).filter(Boolean) },
            active: form.active,
            sortOrder: form.sortOrder,
          }),
        },
      )
      setItems((current) => editing ? current.map((item) => item.id === plan.id ? plan : item) : [...current, plan])
      setEditing(null)
      setForm(empty)
      setMessage('Plan saved and synced to Stripe. Price changes create a new Stripe Price automatically.')
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Plan could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  function edit(plan: Plan) {
    setEditing(plan.id)
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: plan.price,
      features: featureText(plan.features),
      active: plan.active,
      sortOrder: plan.sortOrder,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Subscription Plans" description="Manage monthly, VAT-inclusive plans. Stripe products and prices are created by My Vet automatically." />
      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end">
        <button type="button" disabled={busy} onClick={() => void syncStripe()} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? 'Syncing…' : 'Set up / resync Stripe catalog'}
        </button>
      </div>

      <form onSubmit={(event) => void save(event)} className="grid gap-3 rounded-2xl bg-white p-5 shadow-lg md:grid-cols-2">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Plan name" className="h-10 rounded-md border px-3 text-sm" />
        <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="h-10 rounded-md border px-3 text-sm" />
        <label className="grid gap-1 text-xs text-muted-foreground">
          Monthly price (VAT included)
          <input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="h-10 rounded-md border px-3 text-sm text-black" />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Billing
          <input value="GBP · Monthly" readOnly className="h-10 rounded-md border bg-slate-50 px-3 text-sm text-black" />
        </label>
        <input value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} placeholder="Features, comma separated" className="h-10 rounded-md border px-3 text-sm" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />Active</label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Sort order
          <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="h-10 rounded-md border px-3 text-sm text-black" />
        </label>
        <div className="flex justify-end gap-2 md:col-start-2">
          <button type="button" onClick={() => { setEditing(null); setForm(empty) }} className="rounded-md border px-4 text-sm">Clear</button>
          <button disabled={busy} className="rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white disabled:opacity-50">{editing ? 'Update plan' : 'Create plan'}</button>
        </div>
      </form>

      <section className="grid gap-4 lg:grid-cols-3">
        {items.map((plan) => (
          <Card key={plan.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{plan.name}</h2>
                <p className="mt-2 text-3xl font-semibold text-[#064071]">£{Number(plan.price).toLocaleString('en-GB')}<span className="text-sm text-muted-foreground"> / month</span></p>
                <p className="mt-1 text-xs text-muted-foreground">VAT included</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{plan.active ? 'Active' : 'Inactive'}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${plan.stripeProductId && plan.stripePriceId ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {plan.stripeProductId && plan.stripePriceId ? 'Stripe synced' : 'Not synced'}
                </span>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{plan.description}</p>
            <button type="button" onClick={() => edit(plan)} className="mt-5 h-10 rounded-md border text-sm font-semibold">Edit plan</button>
          </Card>
        ))}
      </section>
    </div>
  )
}
