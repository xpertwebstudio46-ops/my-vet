import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingHistoryItem } from './subscription-types'

const billingHistory: BillingHistoryItem[] = [
  {
    id: 'inv-1048',
    invoice: 'INV-1048',
    date: '01 Aug 2026',
    description: 'Professional Plan monthly subscription',
    amount: '\u00a349',
    status: 'Paid',
  },
  {
    id: 'inv-1031',
    invoice: 'INV-1031',
    date: '01 Jul 2026',
    description: 'Professional Plan monthly subscription',
    amount: '\u00a349',
    status: 'Paid',
  },
  {
    id: 'inv-1014',
    invoice: 'INV-1014',
    date: '14 Jun 2026',
    description: 'Featured listing boost refund',
    amount: '\u00a329',
    status: 'Refunded',
  },
]

export function BillingHistoryCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-lg shadow-black/10">
      <div className="border-b border-gray-200/80 p-5">
        <h2 className="text-base font-semibold text-black">Billing history</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-gray-200/80 text-sm text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Invoice</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">PDF</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((item) => (
              <tr key={item.id} className="border-b border-gray-200/80 last:border-b-0">
                <td className="px-5 py-4 text-sm font-semibold text-black">
                  {item.invoice}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {item.date}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {item.description}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-black">
                  {item.amount}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      item.status === 'Paid'
                        ? 'bg-[#EEF7F5] text-[#01AEAD]'
                        : 'bg-[#064071]/10 text-[#064071]',
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-[#064071] hover:bg-slate-50"
                  >
                    <Download className="size-4" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
