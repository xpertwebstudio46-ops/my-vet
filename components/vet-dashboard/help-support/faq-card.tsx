'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'
import type { VetFaq } from './help-support-data'

export function FaqCard({ faqs }: { faqs: VetFaq[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-4">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Frequently asked questions
        </h2>
      </div>
      <ul className="flex flex-col">
        {faqs.map((faq, index) => {
          const isOpen = open === index

          return (
            <li key={faq.question}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 border-b border-gray-200/80 px-4 py-5 text-left last:border-b-0"
              >
                <span className="dashboard-outfit text-[16px] font-semibold text-black">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <p className="dashboard-font border-b border-gray-200/80 px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
