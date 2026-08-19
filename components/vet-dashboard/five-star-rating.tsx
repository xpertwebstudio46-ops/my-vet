import { Star } from 'lucide-react'

export function FiveStarRating({
  sizeClass = 'size-4',
}: {
  sizeClass?: string
}) {
  return (
    <span className="flex items-center gap-1 text-warning">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${sizeClass} fill-warning text-warning`} />
      ))}
    </span>
  )
}
