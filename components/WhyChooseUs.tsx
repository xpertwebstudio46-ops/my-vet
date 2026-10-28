import Image from 'next/image'
import Link from 'next/link'

const features = [
  { text: 'Verified veterinary practices' },
  { text: 'Genuine reviews from real pet owners' },
  { text: 'Transparent vet prices and services' },
  { text: 'Small animal, equine, farm and exotic vets' },
  { text: 'Nationwide coverage across the UK' },
  { text: 'Easy side-by-side comparison of vets near you' },
]

const practiceFeatures = [
  "Full, expandable price lists that make your fees clear, in line with the CMA?s recommendations on vet price transparency",
  'Staff profiles with qualifications and RCVS registration',
  'Your specialities, from small animal care to equine, farm and exotic vets',
  'Call-out areas and zone days for mobile, farm and equine work',
  'Group ownership, so clients can see whether you?re independent or part of a larger veterinary group',
]

const ownerFeatures = ['Location and postcode', 'Price', 'Reviews from other pet owners', 'Staff experience and specialist skills']

const WhyChooseUs = () => {
  return (
    <section className="px-4 py-12 bg-white sm:px-6 sm:py-16 lg:pt-0">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-8 lg:gap-12">

        {/* Left — text content */}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-bold text-[32px] text-[#064071] mb-4 leading-tight sm:text-[40px]">
            Why {' '}
            <span style={{ color: '#01AEAD' }}>Choose</span> My Vet?
          </h2>

          <p className="text-[16px] sm:text-[18px] font-sans font-semibold leading-relaxed mb-8 max-w-xl">
            Our aim is to create the UK&apos;s leading online directory connecting pet owners with trusted veterinary practices.
          </p>

          <div className="space-y-6 mb-8">
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 sm:p-6">
              <h3 className="font-heading text-2xl font-bold text-[#064071] mb-3">For Vet Practices</h3>
              <p className="text-base leading-relaxed text-slate-700 mb-4">My Vet makes it simple to manage your practice&apos;s online presence in one place. You can update your reviews, services and vet prices from a single, easy-to-use dashboard, with no design skills or technical knowledge needed.</p>
              <p className="font-semibold text-[#064071] mb-3">Your practice profile can show:</p>
              <ul className="list-disc pl-5 space-y-3 text-sm sm:text-base leading-relaxed text-slate-700 marker:text-teal-600">
                {practiceFeatures.map((text) => <li key={text}>{text}</li>)}
              </ul>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700">Pet owners can then compare your practice with other vets near them, side by side.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h3 className="font-heading text-2xl font-bold text-[#064071] mb-3">For Pet Owners</h3>
              <p className="text-base leading-relaxed text-slate-700 mb-4">Finding the right vet is quick and free. Create your account, add profiles for your pets, and start searching for vets near you by:</p>
              <ul className="grid gap-3 sm:grid-cols-2 list-disc pl-5 text-sm sm:text-base text-slate-700 marker:text-teal-600">
                {ownerFeatures.map((text) => <li key={text}>{text}</li>)}
              </ul>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700">Whether you have a dog, a cat, a horse, livestock or an exotic pet, you can compare local practices before you book. Verified pet owners can also leave reviews to help other owners.</p>
            </div>
          </div>
          <h3 className="font-heading font-bold text-2xl text-[#064071] mb-5">Why Pet Owners and Vets Use My Vet</h3>

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
          <p className="mt-6 border-l-4 border-teal-400 pl-4 text-base leading-relaxed text-slate-600">Our goal is to become the UK&apos;s leading veterinary gateway, connecting pet owners with trusted local vet practices.</p>
        </div>

        {/* Right — collage image */}
        <div className="w-full shrink-0 lg:w-[460px] lg:sticky lg:top-24">
          <div className="relative h-[340px] sm:h-[460px] lg:h-[500px]">
          <Image
            src="/images/meji.png"
            alt="Pet owners with their dogs and horse"
            fill
            sizes="(max-width: 1024px) 100vw, 460px"
            className="object-contain"
          />
          <div className="absolute left-1/2 top-1/2 w-[72%] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xl sm:p-5">
            <h3 className="font-heading text-lg font-bold leading-tight text-[#064071] sm:text-xl">Join the My Vet family</h3>
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

export default WhyChooseUs
