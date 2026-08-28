import Image from 'next/image'
import Link from 'next/link'

const categories = [
  {
    id: 1,
    icon: '/images/icon-2.png',
    title: 'Small Animal Vets',
    href: '/vet-search?animalType=small-animals',
    description: 'Find trusted dog & cat veterinary care near you',
  },
  {
    id: 2,
    icon: '/images/icon-1.png',
    title: 'Equine Specialists',
    href: '/vet-search?animalType=equine',
    description: 'Specialist equine veterinary professionals',
  },
  {
    id: 3,
    icon: '/images/icon-3.png',
    title: 'Farm Animal Vets',
    href: '/vet-search?animalType=farm-animals',
    description: 'Farm livestock health & emergency care services',
  },
  {
    id: 4,
    icon: '/images/icon-4.png',
    title: 'Exotic Animal Care',
    href: '/vet-search?animalType=exotics',
    description: 'Specialized care for reptiles, birds, and exotics',
  },
  {
    id: 5,
    icon: '/images/icon-5.png',
    title: 'Emergency 24/7 Vets',
    href: '/vet-search?service=Emergency+Care',
    description: 'Immediate out-of-hours emergency care',
  },
  {
    id: 6,
    icon: '/images/icon-6.png',
    title: 'Holistic & Therapy',
    href: '/vet-search?service=Holistic',
    description: 'Alternative therapies and rehabilitation',
  },
]

const SearchByAnimalType = () => {
  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-[32px] font-heading font-bold leading-tight text-[#0d2e5e] sm:text-[40px]">
            Search by{' '}
            <span style={{ color: '#13b8a8' }}>Animal Type</span>
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-center text-black text-[16px] font-sans mb-8 max-w-xl font-normal mx-auto sm:mb-12">
          Select a category to find specialized veterinary professionals tailored
          to your animal&apos;s specific needs.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
            >
              {/* Teal icon box */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                
              >
                <Image
                  src={cat.icon}
                  alt={cat.title}
                  width={62}
                  height={62}
                  className="object-contain"
                />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-[24px] font-semibold text-[#0d2e5e] mb-1  transition-colors">
                  {cat.title}
                </h3>
                <p className="text-gray-500 text-[16px] font-heading leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}

export default SearchByAnimalType
