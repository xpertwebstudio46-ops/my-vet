'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { PublicReview } from '@/lib/api/types'

const Testimonials = ({ reviews, unavailable = false }: { reviews: PublicReview[]; unavailable?: boolean }) => {
  const testimonials = reviews.map((review) => ({
    id: review.id,
    quote: review.comment,
    name: `${review.user.firstName} ${review.user.lastName ? `${review.user.lastName[0]}.` : ''}`.trim(),
    initial: review.user.firstName.charAt(0).toUpperCase(),
    rating: review.rating,
    practice: review.practice,
  }))
  const [start, setStart] = useState(0)
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1024) setVisible(3)
      else if (window.innerWidth >= 640) setVisible(2)
      else setVisible(1)
    }

    updateVisible()
    window.addEventListener('resize', updateVisible)
    return () => window.removeEventListener('resize', updateVisible)
  }, [])

  const maxStart = Math.max(testimonials.length - visible, 0)
  const safeStart = Math.min(start, maxStart)
  const canPrev = safeStart > 0
  const canNext = safeStart + visible < testimonials.length

  const prev = () => { if (canPrev) setStart((s) => Math.max(s - 1, 0)) }
  const next = () => { if (canNext) setStart((s) => Math.min(s + 1, maxStart)) }

  const translateX = -(safeStart * (100 / visible))

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="font-heading font-bold text-[32px] text-[#064071] leading-tight sm:text-[40px]">
            Trusted by Pet{' '}
            <span style={{ color: '#13b8a8' }}>Owners</span>{' '}
            Nationwide
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-center text-black text-[16px] mb-10">
          Don&apos;t just take our word for it. Hear from the community of animal
          lovers who use My Vet.
        </p>

        {/* Slider with side arrows */}
        {testimonials.length === 0 ? (
          <p role="status" className="rounded-xl bg-slate-50 p-8 text-center text-slate-600">
            {unavailable ? 'Reviews are temporarily unavailable. Please try again later.' : 'No published reviews yet.'}
          </p>
        ) : <div className="relative flex items-center sm:gap-3">

          {/* Left arrow */}
          <button
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous"
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors sm:static sm:h-10 sm:w-10 sm:translate-y-0"
            style={{
              borderColor: canPrev ? '#13b8a8' : '#d1d5db',
              color: canPrev ? '#13b8a8' : '#d1d5db',
              backgroundColor: '#ffffff',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Slider viewport */}
          <div className="w-full overflow-hidden sm:flex-1">
            {/* Sliding track */}
            <div
              className="flex"
              style={{
                transform: `translateX(${translateX}%)`,
                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="shrink-0 px-1 sm:px-2.5"
                style={{ width: `${100 / visible}%` }}
              >

                
                <div
                  className=" p-6 flex flex-col justify-between h-full"
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="mb-4 flex gap-1" role="img" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`size-4 ${index < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}
                  </div>
                  {/* Quote */}
                  <p
                    className="line-clamp-6 text-gray-700 leading-relaxed mb-6 font-sans text-[16px]"
                    
                  >
                    {t.quote}
                  </p>

                  {/* Author */}
                  <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#13b8a8' }}
                    >
                      <span
                        className="text-white font-sans font-normal text-[24px]"
                    
                      >
                        {t.initial}
                      </span>
                    </div>
                    <span
                      className="text-black font-sans font-normal text-[16px]"
                  
                    >
                      {t.name}
                    </span>
                  </div>
                  <Link href={`/vet-search/${encodeURIComponent(t.practice.slug)}`} className="mt-3 inline-block text-sm font-medium text-[#064071] hover:underline">{t.practice.name}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Right arrow */}
          <button
            onClick={next}
            disabled={!canNext}
            aria-label="Next"
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors sm:static sm:h-10 sm:w-10 sm:translate-y-0"
            style={{
              borderColor: canNext ? '#13b8a8' : '#d1d5db',
              color: canNext ? '#13b8a8' : '#d1d5db',
              backgroundColor: '#ffffff',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

        </div>}

      </div>
    </section>
  )
}

export default Testimonials
