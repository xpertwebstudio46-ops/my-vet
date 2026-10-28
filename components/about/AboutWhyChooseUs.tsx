import Image from 'next/image'
import Link from 'next/link'

const features = [
  { text: 'Verified veterinary practices' },
  { text: 'Real reviews from pet owners' },
  { text: 'Transparent services & pricing' },
  { text: 'Specialist animal categories' },
  { text: 'Nationwide coverage across UK' },
  { text: 'Easy comparison of vets near you' },
]

const AboutWhyChooseUs = () => {
  return (
    <section className="px-4 py-12 bg-white sm:px-6 sm:py-16 lg:pt-0">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

        {/* Left — text content */}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-bold text-[32px] text-[#064071] mb-4 leading-tight sm:text-[40px]">
            Why {' '}
            <span style={{ color: '#01AEAD' }}>Choose</span> My Vet?
          </h2>

          <p className="text-[16px] sm:text-[18px] font-sans font-bold leading-relaxed mb-6 max-w-xl">
            Our aim is to create the UK&apos;s leading online directory connecting pet owners with trusted veterinary practices.
          </p>
          <p className="text-[16px] sm:text-[18px] font-sans leading-relaxed mb-8 max-w-xl">
            We make it simple for vets to manage their reviews, services and pricing in one easy to use platform, no design skills or technical experience required.
          </p>

          {/* Features — 2 column grid */}
          <div className="grid grid-cols-1 gap-y-4 gap-x-10 sm:grid-cols-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                <svg
                  className="mt-0.5 w-4 h-4 shrink-0"
                  style={{ color: '#13b8a8' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — collage image */}
        <div className="w-full shrink-0 lg:w-[460px]">
          <div className="relative h-[430px] sm:h-[550px] lg:h-[400px]">
          <Image
            src="/images/meji.png"
            alt="Pet owners with their dogs and horse"
            fill
            sizes="(max-width: 1024px) 100vw, 460px"
            className="rounded-2xl object-contain"
          />
          <div className="absolute left-1/2 top-1/2 w-[72%] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xl sm:p-5">
            <h3 className="font-heading text-lg font-bold leading-tight text-[#064071] sm:text-xl">Are you a vet practices? Join today</h3>
            <div className="mt-3">
              <Link href="/register?role=vet" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#13b8a8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0fa598]">Sign Up</Link>
            </div>
          </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutWhyChooseUs
