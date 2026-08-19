import { PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-primary text-brand-foreground shadow-sm">
        <PawPrint className="size-5" />
      </div>
      <div className="flex items-baseline gap-1 leading-none">
        <span className="dashboard-heading text-lg font-normal text-primary">
          MY
        </span>
        <span className="dashboard-heading text-lg font-normal text-brand">
          VET
        </span>
      </div>
    </div>
  )
}
