type StatusPillValue =
  | 'Active'
  | 'Pending'
  | 'Inactive'
  | 'Published'
  | 'Draft'
  | 'Archived'
  | 'Replied'
  | 'New'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'ARCHIVED'

export function StatusPill({ status }: { status: StatusPillValue }) {
  const styles: Record<StatusPillValue, string> = {
    Active: 'bg-[#EEF7F5] text-[#01AEAD]',
    Pending: 'bg-amber-100 text-amber-700',
    Inactive: 'bg-slate-100 text-slate-600',
    Published: 'bg-[#EEF7F5] text-[#01AEAD]',
    Draft: 'bg-slate-100 text-slate-600',
    Archived: 'bg-slate-100 text-slate-600',
    Replied: 'bg-[#EEF7F5] text-[#01AEAD]',
    New: 'bg-amber-100 text-amber-700',
    PUBLISHED: 'bg-[#EEF7F5] text-[#01AEAD]',
    DRAFT: 'bg-slate-100 text-slate-600',
    ARCHIVED: 'bg-slate-100 text-slate-600',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}
