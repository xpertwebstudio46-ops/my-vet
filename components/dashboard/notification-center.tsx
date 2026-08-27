'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import type { Paginated } from '@/lib/api/types'

type Notification = { id: string; category: string; title: string; message: string; actionUrl: string | null; readAt: string | null; createdAt: string }

export function NotificationCenter({ title }: { title: string }) {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { void apiClient<Paginated<Notification>>('/api/notifications?page=1&limit=100').then((result) => setItems(result.items)).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Notifications could not be loaded.')).finally(() => setLoading(false)) }, [])
  async function readAll() { try { await apiClient('/api/notifications/read-all', { method: 'PATCH' }); setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))); window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { all: true } })) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Notifications could not be updated.') } }
  async function read(item: Notification) { try { if (!item.readAt) { await apiClient(`/api/notifications/${item.id}/read`, { method: 'PATCH' }); setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: new Date().toISOString() } : value)); window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { id: item.id } })) } if (item.actionUrl) router.push(notificationRoute(item.actionUrl)) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Notification could not be opened.') } }
  async function remove(item: Notification) { try { await apiClient(`/api/notifications/${item.id}`, { method: 'DELETE' }); setItems((current) => current.filter((value) => value.id !== item.id)); window.dispatchEvent(new CustomEvent('myvet:notifications-updated', { detail: { id: item.id, deleted: true } })) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Notification could not be deleted.') } }
  return <div className="min-w-0 space-y-6"><PageHeader title={title} description="Live account and practice updates."><button type="button" onClick={() => void readAll()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white"><CheckCheck className="size-4" />Mark all read</button></PageHeader>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<Card className="overflow-hidden p-0">{loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</p> : items.length ? items.map((item) => <div key={item.id} className={`flex flex-col gap-3 border-b p-4 last:border-0 sm:flex-row sm:gap-4 sm:p-5 ${item.readAt ? 'bg-white' : 'bg-teal-50/50'}`}><div className="flex min-w-0 gap-3 sm:flex-1 sm:gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7F5] text-[#01AEAD]"><Bell className="size-5" /></span><button type="button" onClick={() => void read(item)} className="min-w-0 flex-1 text-left"><p className="break-words font-semibold text-black">{item.title}</p><p className="mt-1 break-words text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('en-GB')} &middot; {item.category}</p></button></div><button type="button" onClick={() => void remove(item)} aria-label="Delete notification" className="self-end rounded-md p-2 text-red-600 hover:bg-red-50 sm:self-center"><Trash2 className="size-4" /></button></div>) : <p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>}</Card></div>
}

function notificationRoute(path: string) {
  const legacy: Record<string, string> = { '/vet/appointments': '/vet-dashboard', '/vet/reviews': '/vet-dashboard/reviews', '/vet/subscription': '/vet-dashboard/subscription', '/vet/featured-listing': '/vet-dashboard/featured-listing', '/vet/practice': '/vet-dashboard/practice-profile', '/dashboard/appointments': '/appointment-history', '/dashboard/reviews': '/my-reviews' }
  return legacy[path] ?? (path.startsWith('/') ? path : '/')
}
