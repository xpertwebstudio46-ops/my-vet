'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient } from '@/lib/api/client'
import type { Paginated, User } from '@/lib/api/types'

type VetAccount = User & { deletedAt: string | null }

export function IncompleteVetAccounts({ searchTerm }: { searchTerm: string }) {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<VetAccount[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 25

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ role: 'VET', practiceRegistration: 'INCOMPLETE', page: String(page), limit: String(limit) })
    if (searchTerm) params.set('q', searchTerm)
    void apiClient<Paginated<VetAccount>>(`/api/admin/users?${params}`)
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Veterinary accounts could not be loaded.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, searchTerm])

  function changePage(nextPage: number) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return <section aria-labelledby="incomplete-vet-accounts" className="space-y-3">
    <div>
      <h2 id="incomplete-vet-accounts" className="font-semibold text-black">Not submitted{!loading && !error ? ` (${total})` : ''}</h2>
      <p className="mt-1 text-sm text-muted-foreground">These veterinary accounts have no linked practice submission. A practice can be reviewed after its details are submitted.</p>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Account holder</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Account access</th><th className="p-4">Registration</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading veterinary accounts…</td></tr> : !items.length ? <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No veterinary accounts with incomplete practice registration{searchTerm ? ' match your search' : ''}.</td></tr> : items.map((item) => <tr key={item.id} className="border-b">
              <td className="p-4 font-semibold">{item.firstName} {item.lastName}</td>
              <td className="p-4">{item.email}</td>
              <td className="p-4">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
              <td className="p-4">{item.deletedAt ? 'Deactivated' : 'Active'}</td>
              <td className="p-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Not submitted</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {total > limit && <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <div className="flex gap-2"><button type="button" disabled={loading || page === 1} onClick={() => changePage(page - 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Previous</button><button type="button" disabled={loading || page * limit >= total} onClick={() => changePage(page + 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Next</button></div>
      </div>}
    </Card>}
  </section>
}
