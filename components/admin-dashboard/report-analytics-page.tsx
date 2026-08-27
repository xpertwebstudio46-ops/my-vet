'use client'

import { useEffect, useState } from 'react'
import { Download, Eye, Search } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { apiBaseUrl, apiClient, ApiClientError } from '@/lib/api/client'
import { getAccessToken } from '@/lib/auth/access-token'
import { AdminPageBanner } from './shared/admin-page-banner'

type Report = { months: Array<{ month: string; signups: number; revenue: string }>; traffic: { views: number; searches: number }; totalRevenue: string; topPractices: Array<{ id: string; name: string; rating: string; reviewCount: number }> }

export function ReportAnalyticsPage() {
  const now = new Date()
  const yearAgo = new Date(now)
  yearAgo.setFullYear(now.getFullYear() - 1)
  const [start, setStart] = useState(yearAgo.toISOString().slice(0, 10))
  const [end, setEnd] = useState(now.toISOString().slice(0, 10))
  const [data, setData] = useState<Report | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiClient<Report>(`/api/admin/reports/overview?start=${start}&end=${end}`)
      .then(setData)
      .catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Report could not be loaded.'))
  }, [start, end])

  async function load() {
    setError('')
    try {
      setData(await apiClient<Report>(`/api/admin/reports/overview?start=${start}&end=${end}`))
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Report could not be loaded.')
    }
  }

  async function download() {
    const response = await fetch(`${apiBaseUrl()}/api/admin/reports/export.csv?start=${start}&end=${end}`, { headers: { authorization: `Bearer ${getAccessToken()}` }, credentials: 'include' })
    if (!response.ok) { setError('Report export failed.'); return }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'my-vet-revenue.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner title="Reports & Analytics" description="Production signups, traffic and paid invoice revenue." />
      <div className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2 lg:flex lg:flex-wrap"><label className="grid gap-1 text-sm font-medium sm:block">Start<input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="h-10 rounded-md border px-3 sm:ml-2" /></label><label className="grid gap-1 text-sm font-medium sm:block">End<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="h-10 rounded-md border px-3 sm:ml-2" /></label><button onClick={() => void load()} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white">Refresh</button><button onClick={() => void download()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold lg:ml-auto"><Download className="size-4" />Export CSV</button></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {data && <><section className="grid gap-4 sm:grid-cols-3"><Metric label="Profile views" value={data.traffic.views.toLocaleString()} icon={<Eye />} /><Metric label="Searches" value={data.traffic.searches.toLocaleString()} icon={<Search />} /><Metric label="Revenue" value={money(data.totalRevenue)} icon={<Download />} /></section><Card className="p-4 sm:p-5"><h2 className="mb-4 font-semibold">Monthly performance</h2><div className="grid gap-3">{data.months.length ? data.months.map((month) => <div key={month.month} className="grid gap-1 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3"><span>{month.month}</span><span>{month.signups} signups</span><span className="font-semibold sm:text-right">{money(month.revenue)}</span></div>) : <p className="text-sm text-muted-foreground">No activity in this period.</p>}</div></Card><Card className="p-4 sm:p-5"><h2 className="mb-4 font-semibold">Top practices</h2>{data.topPractices.map((practice) => <div key={practice.id} className="flex flex-col gap-1 border-b py-3 last:border-0 sm:flex-row sm:justify-between"><span className="break-words">{practice.name}</span><span className="shrink-0 text-sm font-semibold">{practice.rating} &middot; {practice.reviewCount} reviews</span></div>)}</Card></>}
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card className="flex min-w-0 items-center justify-between gap-3 p-4 sm:p-5"><div className="min-w-0"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 break-words text-2xl font-semibold">{value}</p></div><span className="shrink-0 text-[#01AEAD] [&>svg]:size-5">{icon}</span></Card>
}

function money(value: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value))
}
