import { Star } from 'lucide-react'

export function StarRating({
  value,
  label,
}: {
  value: number
  label?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-warning">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${
              index < Math.round(value)
                ? 'fill-warning text-warning'
                : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-black">
        {label ?? value.toFixed(1)}
      </span>
    </div>
  )
}
