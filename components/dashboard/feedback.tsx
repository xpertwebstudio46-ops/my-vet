'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white bg-white px-6 py-16 text-center shadow-lg shadow-black/10">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
        <Icon className="size-6" />
      </div>
      <h3 className="dashboard-heading mt-4 text-xl font-normal text-primary">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronRight className="size-4 rotate-180" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'size-9 rounded-lg text-sm font-medium transition-colors',
            p === page
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:bg-muted',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
