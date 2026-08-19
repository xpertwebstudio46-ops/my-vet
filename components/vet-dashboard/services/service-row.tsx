import { Trash2 } from 'lucide-react'
import { ServiceToggle } from './service-toggle'
import type { VetService } from './service-types'

export function ServiceRow({
  service,
  onToggle,
  onDelete,
}: {
  service: VetService
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200/80 px-5 py-4 last:border-b-0 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-black">{service.name}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {service.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4 md:justify-end">
        <span className="min-w-20 rounded-full bg-[#EEF7F5] px-3 py-1 text-center text-sm font-semibold text-[#064071]">
          {service.price}
        </span>
        <ServiceToggle active={service.active} onClick={onToggle} />
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${service.name}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
