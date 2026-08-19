'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'

export function LanguagesCard() {
  const [language, setLanguage] = useState('')
  const [languages, setLanguages] = useState(['English', 'Urdu', 'Spanish'])

  function addLanguage() {
    const nextLanguage = language.trim()
    if (!nextLanguage) return
    if (languages.some((item) => item.toLowerCase() === nextLanguage.toLowerCase())) {
      setLanguage('')
      return
    }

    setLanguages((current) => [...current, nextLanguage])
    setLanguage('')
  }

  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Languages spoken
      </h2>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1 text-sm font-medium text-black">
          Add a language
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addLanguage()
              }
            }}
            placeholder="French"
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
        </label>
        <button
          type="button"
          onClick={addLanguage}
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
        >
          <Plus className="size-4 text-slate-400" />
          Add
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {languages.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-[#EEF7F5] px-3 py-1 text-xs font-semibold text-[#01AEAD]"
          >
            {item}
            <button
              type="button"
              onClick={() =>
                setLanguages((current) =>
                  current.filter((languageItem) => languageItem !== item),
                )
              }
              aria-label={`Remove ${item}`}
              className="rounded-full hover:bg-white/70"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </Card>
  )
}
