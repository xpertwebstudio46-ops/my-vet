import { cn } from '@/lib/utils'

export function UserAvatar({
  name,
  className,
}: {
  src?: string
  name: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      aria-label={`${name} avatar`}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground shadow-md shadow-black/10',
        className,
      )}
    >
      {initials}
    </span>
  )
}
