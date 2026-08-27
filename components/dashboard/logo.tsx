import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center', className)}>
      <img
        src="/images/header-logo.png"
        alt="MY VET"
        className="h-auto w-[132px] max-w-full"
      />
    </div>
  )
}
