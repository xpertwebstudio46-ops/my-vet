'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Eye, MousePointerClick } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'

type Analytics = { buckets: Array<{ month: string; views: number; contacts: number; bookings: number }>; totals: { views: number; contacts: number } }

export function VetAnalyticsPage() {
  const [months, setMonths] = useState(12); const [data, setData] = useState<Analytics | null>(null); const [error, setError] = useState('')
  useEffect(() => { void apiClient<Analytics>(`/api/analytics/vet?months=${months}`).then(setData).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Analytics could not be loaded.')) }, [months])
  const bookings = data?.buckets.reduce((total, item) => total + item.bookings, 0) ?? 0
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg"><div><h1 className="dashboard-heading text-5xl">Analytics</h1><p className="text-sm text-muted-foreground">Production profile views and contact conversions.</p></div><select value={months} onChange={(event) => setMonths(Number(event.target.value))} className="h-10 rounded-md border px-3 text-sm"><option value={6}>6 months</option><option value={12}>12 months</option><option value={24}>24 months</option></select></div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{data && <><section className="grid gap-4 sm:grid-cols-3"><Metric label="Profile views" value={data.totals.views} icon={<Eye />} /><Metric label="Contact actions" value={data.totals.contacts} icon={<MousePointerClick />} /><Metric label="Bookings" value={bookings} icon={<CalendarCheck />} /></section><Card className="p-5"><h2 className="mb-4 font-semibold">Monthly performance</h2><div className="grid gap-3">{data.buckets.map((item) => <div key={item.month} className="grid grid-cols-4 rounded-lg bg-slate-50 p-3 text-sm"><span>{item.month}</span><span>{item.views} views</span><span>{item.contacts} contacts</span><span className="text-right">{item.bookings} bookings</span></div>)}</div></Card></>}</div>
}
function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <Card className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</p></div><span className="text-[#01AEAD] [&>svg]:size-5">{icon}</span></Card> }
