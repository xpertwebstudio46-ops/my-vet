'use client'

import { useState } from 'react'
import { Copy, Mail } from 'lucide-react'
import { vetInvitationBody, vetInvitationGmail, vetInvitationMailto, vetInvitationSubject } from '@/lib/vet-invitation'

export function InviteYourVet() {
  const [feedback, setFeedback] = useState('')

  async function copyInvitation() {
    setFeedback('')
    try {
      await navigator.clipboard.writeText(`Subject: ${vetInvitationSubject}\r\n\r\n${vetInvitationBody}`)
      setFeedback('Invitation copied. Paste it into a new email and add your vet’s email address.')
    } catch {
      setFeedback('Could not copy automatically. Open the invitation below and select the text to copy it.')
    }
  }

  return (
    <section aria-label="Invite your vet" className="my-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#064071]">Would you like your vet to join My Vet?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Invite your practice with a ready-written email. Add your vet’s email address, personalise the message and send it from your own inbox.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a href={vetInvitationGmail} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#064071] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a2550]">
            <Mail aria-hidden="true" className="size-4" />Open in Gmail
          </a>
          <a href={vetInvitationMailto} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064071] px-5 py-3 text-sm font-semibold text-[#064071] transition-colors hover:bg-white">
            <Mail aria-hidden="true" className="size-4" />Use email app
          </a>
          <button type="button" onClick={() => void copyInvitation()} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#064071] px-5 py-3 text-sm font-semibold text-[#064071] transition-colors hover:bg-white">
            <Copy aria-hidden="true" className="size-4" />Copy invitation
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Open in Gmail launches a new browser tab; sign in to Google if needed. Use email app opens your default app, such as Outlook. Add your vet’s address in the To field, check the message and send it.</p>
      <details className="mt-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-[#064071]">Preview invitation</summary>
        <div className="mt-3 rounded-xl border border-teal-100 bg-white p-4">
          {/* <p className="font-semibold">Subject: {vetInvitationSubject}</p> */}
          <p className="mt-3 whitespace-pre-line break-words leading-relaxed">{vetInvitationBody}</p>
        </div>
      </details>
      <p role="status" className="mt-2 text-sm text-[#064071]">{feedback}</p>
    </section>
  )
}
