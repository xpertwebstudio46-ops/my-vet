'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BriefcaseBusiness, MapPin, Search, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { apiClient } from '@/lib/api/client'
import { type JobType, type JobsResult, type Application, jobTypes, jobFieldClass, jobButtonClass, jobError } from '@/lib/jobs'
import JobSkeleton from './JobSkeleton'

export default function JobsBoard() {
  const params = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState(params.get('tab') === 'applications' ? 'applications' : 'jobs')
  const [q, setQ] = useState(''), [location, setLocation] = useState('')
  const [filters, setFilters] = useState({ q: '', location: '', type: '', page: 1 })
  const [data, setData] = useState<JobsResult | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0), [busy, setBusy] = useState('')
  useEffect(() => {
    if (authLoading) return
    let active = true
    queueMicrotask(() => { if (active) { setLoading(true); setError('') } })
    const query = new URLSearchParams({ q: filters.q, location: filters.location, page: String(filters.page), limit: '12', ...(filters.type ? { type: filters.type } : {}) })
    const request = tab === 'applications' ? user ? apiClient<Application[]>('/api/jobs/applications/mine').then((items) => { if (active) setApplications(items) }) : Promise.resolve() : apiClient<JobsResult>(`/api/jobs?${query}`, {}, { authenticated: false }).then((result) => { if (active) setData(result) })
    void request.catch((err) => { if (active) setError(jobError(err)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, tab, user, authLoading, revision])
  async function withdraw(id: string) {
    setBusy(id); setError('')
    try { await apiClient(`/api/jobs/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'WITHDRAWN' }) }); setRevision((v) => v + 1) } catch (err) { setError(jobError(err)) } finally { setBusy('') }
  }
  return <section className="w-full text-left">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-heading text-3xl font-bold text-[#064071]">Veterinary opportunities</h2><p className="mt-2 text-slate-600">Find a role that fits your skills and your life.</p></div><Link href="/vet-dashboard/jobs" className={jobButtonClass}>Post a job</Link></div>
    <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3" aria-label="Jobs views">{[['jobs', 'Browse jobs'], ['applications', 'My applications']].map(([value, label]) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === value ? 'bg-[#064071] text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>)}</div>
    {tab === 'jobs' && <><form onSubmit={(e) => { e.preventDefault(); setFilters((v) => ({ ...v, q, location, page: 1 })) }} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] lg:gap-6 lg:p-6"><label><span className="mb-2 block text-sm font-semibold text-[#064071]">Job title, keyword or practice</span><input className={jobFieldClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Veterinary nurse" maxLength={200} /></label><label><span className="mb-2 block text-sm font-semibold text-[#064071]">City, location or postcode</span><input className={jobFieldClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Manchester" maxLength={200} /></label><button className={`${jobButtonClass} self-end`}><Search size={18} />Search jobs</button></form>
    <div className="mb-7 flex flex-wrap gap-2" aria-label="Employment type">{[['', 'All jobs'], ...Object.entries(jobTypes)].map(([value, label]) => <button key={value} aria-pressed={filters.type === value} onClick={() => setFilters((v) => ({ ...v, type: value as JobType, page: 1 }))} className={`rounded-full border px-4 py-2 text-sm ${filters.type === value ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{label}</button>)}</div></>}
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error} <button className="ml-2 underline" onClick={() => setRevision((v) => v + 1)}>Retry</button></div>}
    {loading || authLoading ? <JobSkeleton /> : tab === 'applications' ? !user ? <div className="rounded-2xl bg-slate-50 p-8 text-center"><p className="mb-4">Sign in to apply for jobs and track your applications.</p><Link href="/jobs?login=pet-owner&tab=applications" className={jobButtonClass}>Sign in</Link></div> : applications.length ? <div className="grid items-start gap-5 xl:grid-cols-2">{applications.map((application) => <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl font-bold text-[#064071]">{application.job?.title}</h3><p className="mt-1 text-slate-600">{application.job?.practice?.name} · {application.job?.location}</p></div><span className="h-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{application.status.toLowerCase()}</span></div><p className="mt-3 text-sm text-slate-500">Applied {new Date(application.createdAt).toLocaleDateString('en-GB')}</p>{application.status !== 'WITHDRAWN' && <button disabled={!!busy} onClick={() => withdraw(application.id)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700">{busy === application.id && <Loader2 size={16} className="animate-spin" />}Withdraw application</button>}</article>)}</div> : <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">You haven&apos;t applied for any jobs yet. Browse jobs to get started.</p> : <>
    <p className="mb-4 text-sm text-slate-500" aria-live="polite">{data?.total ?? 0} opportunities found</p>
    {!data?.items.length ? <div className="rounded-2xl bg-slate-50 p-10 text-center"><BriefcaseBusiness className="mx-auto mb-4 text-teal-600" size={32} /><h3 className="text-xl font-bold text-[#064071]">No jobs found</h3><p className="mt-2 text-slate-600">Try a different keyword or location, or check back soon.</p></div> : <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{data.items.map((job) => <article key={job.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{jobTypes[job.type]}</span>{job.salary && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#064071]">{job.salary}</span>}</div><h3 className="text-xl font-bold text-[#064071]"><Link href={`/jobs/${job.id}`}>{job.title}</Link></h3><p className="mt-2 font-medium text-slate-600">{job.practice?.name}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} />{job.location}</p><p className="my-4 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.description}</p><div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">Posted {new Date(job.createdAt).toLocaleDateString('en-GB')}</span><Link className="text-sm font-bold text-teal-700" href={`/jobs/${job.id}`}>View &amp; apply →</Link></div></article>)}</div>}
    {data && data.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button className={jobButtonClass} disabled={filters.page <= 1} onClick={() => setFilters((v) => ({ ...v, page: v.page - 1 }))}>Previous</button><span className="text-sm">Page {data.page} of {data.totalPages}</span><button className={jobButtonClass} disabled={filters.page >= data.totalPages} onClick={() => setFilters((v) => ({ ...v, page: v.page + 1 }))}>Next</button></div>}</>}
  </section>
}
