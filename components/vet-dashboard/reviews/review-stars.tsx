import { Star } from 'lucide-react'

export function ReviewStars({
  value,
  sizeClass = 'size-4',
}: {
  value: number
  sizeClass?: string
}) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${sizeClass} ${
            index < Math.round(value)
              ? 'fill-warning text-warning'
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </span>
  )
}
