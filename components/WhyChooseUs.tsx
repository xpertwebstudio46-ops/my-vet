import Image from 'next/image'

const features = [
  { text: 'Verified veterinary practices' },
  { text: 'Real reviews from pet owners' },
  { text: 'Transparent services & pricing' },
  { text: 'Specialist animal categories' },
  { text: 'Nationwide coverage across UK' },
  { text: 'Easy comparison of vets near you' },
]

const WhyChooseUs = () => {
  return (
    <section className="pt-0 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

        {/* Left — text content */}
        <div className="flex-1">
          <h2 className="font-heading font-bold text-[48px] text-[#064071] mb-4 leading-tight">
            Why {' '}
            <span style={{ color: '#01AEAD' }}>Choose</span> My Vet?
          </h2>

          <p className="text-[18px] font-sans font-normal leading-relaxed mb-8 max-w-xl">
            A trusted veterinary directory designed to help animal owners
            make informed, confident decisions.
          </p>

          {/* Features — 2 column grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-10">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
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
        <div className="flex-shrink-0 relative w-full lg:w-[480px] h-[360px]">
          <Image
            src="/images/why.png"
            alt="Why Choose My Vet — vet collage"
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-contain"
          />
        </div>

      </div>
    </section>
  )
}

export default WhyChooseUs
