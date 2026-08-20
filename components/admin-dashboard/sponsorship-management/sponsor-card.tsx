import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import type { Sponsor } from './sponsor-types'

export function SponsorCard({ sponsor, onEdit, onRemove }: { sponsor: Sponsor; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-black/10">
      <div className="flex items-start gap-4">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image src={sponsor.imageUrl || '/placeholder.svg'} alt={sponsor.name} fill sizes="64px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-black">{sponsor.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Contract to {new Date(sponsor.endsAt).toLocaleDateString('en-GB')}</p>
          <p className="pt-1 text-xs text-muted-foreground">Starts {new Date(sponsor.startsAt).toLocaleDateString('en-GB')}</p>
        </div>
        <span className="rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]">{sponsor.active ? 'Active' : 'Inactive'}</span>
      </div>
      <div className="mt-5 flex gap-2 border-t border-gray-200/80 pt-4">
        <button type="button" onClick={onEdit} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-black hover:bg-slate-50"><Pencil className="size-4" />Edit</button>
        <button type="button" onClick={onRemove} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-4" />Remove</button>
      </div>
    </div>
  )
}
