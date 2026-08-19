import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white bg-white text-card-foreground shadow-lg shadow-black/10',
        className,
      )}
      {...props}
    />
  )
}

export function HighlightedTitle({ title }: { title: string }) {
  const [firstWord, ...restWords] = title.trim().split(/\s+/)

  return (
    <>
      <span className="text-foreground">{firstWord}</span>
      {restWords.length > 0 && (
        <>
          {' '}
          <span className="text-brand">{restWords.join(' ')}</span>
        </>
      )}
    </>
  )
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-normal leading-none text-black">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}

export function Rating({
  value,
  reviews,
  className,
}: {
  value: number
  reviews?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-1 text-xs', className)}>
      <Star className="size-3.5 fill-warning text-warning" />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {typeof reviews === 'number' && (
        <span className="text-muted-foreground">({reviews})</span>
      )}
    </div>
  )
}

export function StatusBadge({
  label,
  variant,
}: {
  label: string
  variant: 'Open' | 'Closed' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
}) {
  const styles: Record<typeof variant, string> = {
    Open: 'bg-success-muted text-success',
    Closed: 'bg-muted text-muted-foreground',
    Confirmed: 'bg-success-muted text-success',
    Pending: 'bg-warning-muted text-warning-foreground',
    Completed: 'bg-secondary text-secondary-foreground',
    Cancelled: 'bg-destructive/10 text-destructive',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-bold',
        styles[variant],
      )}
    >
      {label}
    </span>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-medium text-secondary-foreground">
      {children}
    </span>
  )
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-white p-1 shadow-md shadow-black/10">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            active === tab
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
