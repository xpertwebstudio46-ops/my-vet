'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { navSections } from './nav-config'

type SidebarProps = {
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed bottom-3 left-3 top-3 z-50 flex w-64 flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-xl shadow-black/10 transition-transform duration-200 lg:sticky lg:bottom-auto lg:top-4 lg:z-auto lg:ml-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => (
            <div key={section.heading ?? 'main'} className="mb-5">
              {section.heading && (
                <p className="dashboard-font px-3 pb-2 text-xs font-normal capitalize text-primary">
                  {section.heading}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = item.href ? pathname === item.href : false
                  const Icon = item.icon
                  const itemClassName = cn(
                    'dashboard-font flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#EEF7F5] text-[#01AEAD]'
                      : item.action === 'logout'
                        ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )

                  return (
                    <li key={item.label}>
                      {item.action === 'logout' ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onLogout()
                          }}
                          className={itemClassName}
                        >
                          <Icon className="size-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href ?? '#'}
                          onClick={onClose}
                          className={itemClassName}
                        >
                          <Icon className="size-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {active && (
                            <span className="ml-auto h-4 w-1 rounded-full bg-[#01AEAD]" />
                          )}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
