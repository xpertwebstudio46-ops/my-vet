import { Archive, Reply } from 'lucide-react'
import { StatusPill } from '../shared/status-pill'

import type { ContactEnquiry } from './contact-types'

export function ContactRow({
  enquiry,
  onReply,
  onArchive,
}: {
  enquiry: ContactEnquiry
  onReply: () => void
  onArchive: () => void
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200/80 p-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-black">{enquiry.name}</h2>
          <StatusPill status={enquiry.status} />
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#064071]">
            {enquiry.subject}
          </p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {enquiry.message}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {enquiry.tagLine}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onReply}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
        >
          <Reply className="size-4 text-slate-400" />
          Reply
        </button>
        <button
          type="button"
          aria-label="Archive enquiry"
          title="Archive enquiry"
          onClick={onArchive}
          className="inline-flex size-10 items-center justify-center rounded-md border border-gray-200 text-slate-400 hover:bg-slate-50 hover:text-[#064071]"
        >
          <Archive className="size-4" />
        </button>
      </div>
    </div>
  )
}
