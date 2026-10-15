'use client'

import { useEffect, useId, useRef, useState } from 'react'

export function ExpandableTeamBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const paragraph = useRef<HTMLParagraphElement>(null)
  const contentId = useId()

  useEffect(() => {
    const element = paragraph.current
    if (!element || expanded) return
    const observer = new ResizeObserver(() => {
      setOverflows(element.scrollHeight > element.clientHeight + 1)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [expanded, text])

  return (
    <div className="mt-2 min-w-0">
      <p ref={paragraph} id={contentId} className={`${expanded ? '' : 'line-clamp-3'} whitespace-pre-line break-words text-sm text-slate-600`}>{text}</p>
      {(overflows || expanded) && <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)} className="mt-1 rounded text-sm font-semibold text-[#085A9E] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#085A9E]">{expanded ? 'Show less' : 'Read more'}</button>}
    </div>
  )
}
