'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Practice } from '@/lib/api/types'

export function PracticeGallery({ media, practiceName }: { media: NonNullable<Practice['galleryMedia']>; practiceName: string }) {
  const images = media.filter((item) => item.mediaType !== 'VIDEO')
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const open = selected !== null
  const current = selected === null ? null : images[selected]

  useEffect(() => {
    if (!open) return
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function move(direction: number) {
    setSelected((index) => index === null ? null : (index + direction + images.length) % images.length)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {media.map((item) => item.mediaType === 'VIDEO' ? (
          <video key={item.id} controls className="aspect-video min-w-0 max-w-full w-full rounded-xl border bg-black" src={item.url} />
        ) : (
          <figure key={item.id} className="min-w-0 overflow-hidden rounded-xl border bg-white">
            <button type="button" onClick={() => setSelected(images.findIndex((image) => image.id === item.id))} aria-label={`Open ${item.altText ?? item.caption ?? `${practiceName} gallery image`}`} className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#13b8a8]">
              <img src={item.url} alt={item.altText ?? item.caption ?? `${practiceName} gallery image`} className="aspect-video w-full object-cover" />
            </button>
            {item.caption && <figcaption className="p-3 text-sm text-slate-500">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog ref={dialog} aria-label={`${practiceName} photo gallery`} onCancel={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null) }} onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          move(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-slate-950 p-3 text-white shadow-xl backdrop:bg-black/80 sm:p-5">
        {current && <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm">Photo {(selected ?? 0) + 1} of {images.length}</p>
            <button type="button" autoFocus onClick={() => setSelected(null)} aria-label="Close gallery" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#13b8a8]"><X className="size-5" /></button>
          </div>
          <img src={current.url} alt={current.altText ?? current.caption ?? `${practiceName} gallery image`} className="max-h-[65svh] w-full object-contain" />
          {current.caption && <p className="mt-3 break-words text-center text-sm text-slate-200">{current.caption}</p>}
          {images.length > 1 && <div className="mt-4 flex justify-between gap-3">
            <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#13b8a8]"><ChevronLeft className="size-6" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next photo" className="flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#13b8a8]"><ChevronRight className="size-6" /></button>
          </div>}
        </>}
      </dialog>
    </>
  )
}
