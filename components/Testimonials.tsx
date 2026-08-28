'use client'

import { useEffect, useState } from 'react'

const testimonials = [
  {
    id: 1,
    quote:
      '"I found an emergency vet within minutes  absolutely life saving platform."',
    name: 'Amina K.',
    initial: 'A',
  },
  {
    id: 2,
    quote:
      '"Finally a transparent way to compare veterinary services and read honest reviews."',
    name: 'Lydia S.',
    initial: 'L',
  },
  {
    id: 3,
    quote:
      '"The reviews helped me choose the right equine specialist for my horse."',
    name: 'Sarah T.',
    initial: 'S',
  },
  {
    id: 4,
    quote:
      '"My Vet made it so easy to find a trusted farm vet in our rural area. Highly recommend!"',
    name: 'James R.',
    initial: 'J',
  },
  {
    id: 5,
    quote:
      '"Great platform — I love being able to read real reviews before booking an appointment."',
    name: 'Claire M.',
    initial: 'C',
  },
  {
    id: 6,
    quote:
      '"Found the perfect exotic animal specialist for my rabbit. Couldn\'t be happier."',
    name: 'David P.',
    initial: 'D',
  },
]

const Testimonials = () => {
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
        <div className="relative flex items-center sm:gap-3">

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
                  {/* Quote */}
                  <p
                    className="text-gray-700 leading-relaxed mb-6 font-sans text-[16px]"
                    
                  >
                    {t.quote}
                  </p>

                  {/* Author */}
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

        </div>

      </div>
    </section>
  )
}

export default Testimonials
