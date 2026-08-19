'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>
        {title && (
          <h2 className="dashboard-heading pr-6 text-xl font-normal text-primary text-balance">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        <div className={cn(title || description ? 'mt-5' : '')}>{children}</div>
      </div>
    </div>
  )
}
