'use client'

import { useState } from 'react'
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react'
import { faqs } from '@/lib/dashboard-data'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

const contacts = [
  {
    icon: Mail,
 
    value: 'support@myvet.co.uk',
    hint: 'We reply within one working day',
  },
  {
    icon: Phone,
 
    value: '0800 118 2200',
    hint: 'Mon–Fri, 9am–6pm',
  },
  {
    icon: MessageCircle,

    value: 'Start a conversation',
    hint: 'Typically replies in a few minutes',
  },
]

export default function HelpSupportPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Help & support"
        description="Answers to common questions, or a direct line to our team."
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="">
          <div className='border-b p-4'>
          <h2 className="dashboard-outfit text-[16px] font-semibold text-primary">
            Frequently asked questions
          </h2>
          </div>
          <ul className="flex flex-col">
            {faqs.map((faq, i) => {
              const isOpen = open === i
              return (
                <li key={i} className="">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center border-b justify-between gap-4 px-4 py-5 text-left"
                  >
                    <span className="dashboard-outfit text-[16px] font-semibold text-primary">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="dashboard-font px-3 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="h-fit">
          <div className='border-b p-4'>

          <h2 className="dashboard-outfit text-[16px] font-semibold text-primary">
            Contact support
          </h2>
          </div>
          <ul className="mt-5 flex flex-col gap-4 p-4">
            {contacts.map((c) => (
              <li key={c.value} className="flex items-center gap-3  border border-gray-400/30 rounded-md p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F5] text-[#01AEAD]">
                  <c.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="dashboard-outfit text-[16px] font-semibold text-primary">
                    {c.value}
                  </p>
              
                  <p className="dashboard-font text-xs text-muted-foreground">{c.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
