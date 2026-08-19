import { MessageSquareReply } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { recentEnquiries } from './data'

function EnquiryStatus({ status }: { status: 'New' | 'Replied' }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === 'New'
          ? 'bg-[#EEF7F5] text-[#01AEAD]'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}

export function RecentEnquiriesCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200/80 p-5">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Recent enquiries
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-[#01AEAD] hover:underline"
        >
          View all
        </button>
      </div>

      <div>
        {recentEnquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            className="grid gap-4 border-b border-gray-200/80 p-5 last:border-b-0 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-black">
                  {enquiry.name}
                </h3>
                <EnquiryStatus status={enquiry.status} />
              </div>
              <p className="mt-1 text-xs font-medium text-[#064071]">
                {enquiry.petReference}
              </p>
              <p className="mt-3 text-sm font-semibold text-black">
                {enquiry.subject}
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {enquiry.body}
              </p>
            </div>

            <div className="flex items-center gap-3 xl:justify-end">
              <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                {enquiry.time}
              </span>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
              >
                <MessageSquareReply className="size-4 text-slate-400" />
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
