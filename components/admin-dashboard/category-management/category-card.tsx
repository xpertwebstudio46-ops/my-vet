'use client'

import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import { AdminIconButton } from '../shared/admin-icon-button'
import { AdminToggle } from '../shared/admin-toggle'

export type CategoryCardItem = { id: string; name: string; description: string | null; imageUrl: string | null; active: boolean; count?: number }
export type CategoryInput = { name: string; description: string | null; active: boolean; file?: File }

export function CategoryCard({ item, countLabel, onToggle, onEdit, onDelete }: { item: CategoryCardItem; countLabel?: string; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex min-h-24 flex-col gap-4 border-b border-gray-200/80 p-4 last:border-b-0 md:flex-row md:items-center">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100"><Image src={item.imageUrl || '/placeholder.svg'} alt={item.name} fill sizes="64px" className="object-cover" /></span>
      <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-black">{item.name}</h2><p className="mt-1 text-sm text-muted-foreground">{item.description || 'No description added.'}</p></div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
        {countLabel && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#064071]">{countLabel}</span>}
        <AdminToggle active={item.active} onClick={onToggle} />
        <AdminIconButton label={`Edit ${item.name}`} onClick={onEdit}><Pencil className="size-4" /></AdminIconButton>
        <AdminIconButton label={`Delete ${item.name}`} onClick={onDelete}><Trash2 className="size-4" /></AdminIconButton>
      </div>
    </div>
  )
}
