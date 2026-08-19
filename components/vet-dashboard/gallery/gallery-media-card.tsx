import Image from 'next/image'
import { Pencil, Play, Trash2 } from 'lucide-react'
import type { GalleryItem } from './gallery-types'

type GalleryMediaCardProps = {
  item: GalleryItem
  onEdit: () => void
  onDelete: () => void
}

export function GalleryMediaCard({
  item,
  onEdit,
  onDelete,
}: GalleryMediaCardProps) {
  const isUploadedVideo =
    item.type === 'video' &&
    (item.image.startsWith('blob:') ||
      /\.(mp4|mov|webm)$/i.test(item.image.split('?')[0]))

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10">
      <div className="relative aspect-[4/3] bg-slate-100">
        {item.type === 'photo' ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            unoptimized={item.image.startsWith('blob:')}
            className="object-cover"
          />
        ) : isUploadedVideo ? (
          <video
            src={item.image}
            controls
            className="h-full w-full bg-black object-cover"
          />
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#064071]/45 text-white">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/15">
              <Play className="ml-1 size-7 fill-white" />
            </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-sm font-semibold text-black">
            {item.title}
          </h2>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              item.type === 'photo'
                ? 'bg-[#01AEAD]/10 text-[#01AEAD]'
                : 'bg-[#064071]/10 text-[#064071]'
            }`}
          >
            {item.type === 'photo' ? 'Photo' : 'Video'}
          </span>
        </div>

        <div className="mt-4 flex justify-start gap-2 border-t border-gray-200/80 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-semibold text-black hover:bg-slate-50"
          >
            <Pencil className="size-4 text-slate-400" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
