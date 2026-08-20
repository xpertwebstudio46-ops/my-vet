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
      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4"><label className="text-sm font-medium">Start<input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="ml-2 h-10 rounded-md border px-3" /></label><label className="text-sm font-medium">End<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="ml-2 h-10 rounded-md border px-3" /></label><button onClick={() => void load()} className="rounded-md bg-[#064071] px-4 text-sm font-semibold text-white">Refresh</button><button onClick={() => void download()} className="ml-auto inline-flex items-center gap-2 rounded-md border px-4 text-sm font-semibold"><Download className="size-4" />Export CSV</button></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {data && <><section className="grid gap-4 sm:grid-cols-3"><Metric label="Profile views" value={data.traffic.views.toLocaleString()} icon={<Eye />} /><Metric label="Searches" value={data.traffic.searches.toLocaleString()} icon={<Search />} /><Metric label="Revenue" value={money(data.totalRevenue)} icon={<Download />} /></section><Card className="p-5"><h2 className="mb-4 font-semibold">Monthly performance</h2><div className="grid gap-3">{data.months.length ? data.months.map((month) => <div key={month.month} className="grid grid-cols-3 rounded-lg bg-slate-50 p-3 text-sm"><span>{month.month}</span><span>{month.signups} signups</span><span className="text-right font-semibold">{money(month.revenue)}</span></div>) : <p className="text-sm text-muted-foreground">No activity in this period.</p>}</div></Card><Card className="p-5"><h2 className="mb-4 font-semibold">Top practices</h2>{data.topPractices.map((practice) => <div key={practice.id} className="flex justify-between border-b py-3 last:border-0"><span>{practice.name}</span><span className="text-sm font-semibold">{practice.rating} &middot; {practice.reviewCount} reviews</span></div>)}</Card></>}
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div><span className="text-[#01AEAD] [&>svg]:size-5">{icon}</span></Card>
}

function money(value: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value))
}
