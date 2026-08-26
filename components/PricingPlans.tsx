import Link from 'next/link'

const plans = [
  {
    name: 'Basic',
    description: 'Perfect for getting your practice on the map.',
    price: '£9',
    period: '/per month',
    features: ['Basic practice info', 'Location visibility', 'Limited search ranking'],
    popular: false,
    href: '/enquire?plan=basic',
  },
  {
    name: 'Professional',
    description: 'Everything you need to build trust and attract clients.',
    price: '£29',
    period: '/per month',
    features: [
      'Full profile page',
      'Services & pricing display',
      'Customer reviews',
      'Analytics dashboard',
    ],
    popular: true,
    href: '/enquire?plan=professional',
  },
  {
    name: 'Premium',
    description: 'Maximize your visibility and grow your practice faster.',
    price: '£59',
    period: '/per month',
    features: ['Featured placement', 'Unlimited media uploads', 'Advanced analytics'],
    popular: false,
    href: '/enquire?plan=premium',
  },
]

const PricingPlans = () => {
  return (
    <section
      className="relative overflow-hidden w-full pt-10 pb-5 px-6"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* Paw print watermarks */}
      <PawPrint size={120} className="absolute top-6 left-6 opacity-10 text-white pointer-events-none" />
      <PawPrint size={80}  className="absolute top-4 left-24 opacity-[0.06] text-white pointer-events-none" />
      <PawPrint size={100} className="absolute bottom-8 right-8 opacity-10 text-white pointer-events-none" />
      <PawPrint size={70}  className="absolute bottom-6 right-28 opacity-[0.06] text-white pointer-events-none" />

      {/* Heading */}
      <div className="relative z-10 text-center ">
        <h2 className="font-display font-extrabold text-[48px] text-white mb-3 leading-tight">
          Grow Your Veterinary{' '}
          <span style={{ color: '#13b8a8' }}>Practice</span>{' '}
          with My Vet
        </h2>
        <p className="text-white font-sans font-normal text-[16px] max-w-4xl mx-auto leading-relaxed">
         Join the UK&apos;s trusted veterinary directory and connect with thousands of pet owners actively looking for care.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 max-w-5xl pt-14  mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-7 flex flex-col ${
              plan.popular ? 'md:-mt-4 md:mb-4' : ''
            }`}
            style={{
              backgroundColor: 'rgba(255,255,255,0.10)',
              border: plan.popular ? '2px solid #13b8a8' : '1px solid rgba(255,255,255,0.25)',
            }}
          >
            {/* Most Popular badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-[250px] -translate-x-1/2">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: '#13b8a8' }}
                >
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan name */}
            <h3
              className="mb-2"
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '28px',
                fontWeight: 700,
                color: plan.popular ? '#13b8a8' : '#ffffff',
              }}
            >
              {plan.name}
            </h3>

            {/* Description */}
            <p
              className="leading-relaxed mb-5"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '18px',
                fontWeight: 300,
                color: '#bfdbfe',
              }}
            >
              {plan.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-6">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {plan.price}
              </span>
              <span className="text-white text-sm">{plan.period}</span>
            </div>
            <p className="-mt-5 mb-6 text-xs text-blue-100">VAT included</p>

            {/* Features */}
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
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
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#bfdbfe',
                    }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <Link
              href={plan.href}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14.64px',
                fontWeight: 400,
                ...(plan.popular
                  ? { backgroundColor: '#13b8a8', color: '#ffffff' }
                  : { backgroundColor: '#ffffff', color: '#0d2e5e' }),
              }}
            >
              Enquire Now
              <img
                src="/images/arrow.png"
                alt=""
                className={`w-4 h-4 object-contain shrink-0 ${plan.popular ? '' : 'invert'}`}
                aria-hidden="true"
              />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

function PawPrint({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="50" cy="72" rx="22" ry="18" />
      <ellipse cx="24" cy="46" rx="10" ry="13" transform="rotate(-15 24 46)" />
      <ellipse cx="40" cy="36" rx="10" ry="13" transform="rotate(-5 40 36)" />
      <ellipse cx="60" cy="36" rx="10" ry="13" transform="rotate(5 60 36)" />
      <ellipse cx="76" cy="46" rx="10" ry="13" transform="rotate(15 76 46)" />
    </svg>
  )
}

export default PricingPlans
