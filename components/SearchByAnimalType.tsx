import Image from 'next/image'
import Link from 'next/link'

const categories = [
  {
    id: 1,
    icon: '/images/icon-2.png',
    title: 'Small Animal Vets',
    description: 'Find trusted dog & cat veterinary care near you',
  },
  {
    id: 2,
    icon: '/images/icon-1.png',
    title: 'Equine Specialists',
    description: 'Specialist equine veterinary professionals',
  },
  {
    id: 3,
    icon: '/images/icon-3.png',
    title: 'Farm Animal Vets',
    description: 'Farm livestock health & emergency care services',
  },
  {
    id: 4,
    icon: '/images/icon-4.png',
    title: 'Exotic Animal Care',
    description: 'Specialized care for reptiles, birds, and exotics',
  },
  {
    id: 5,
    icon: '/images/icon-5.png',
    title: 'Emergency 24/7 Vets',
    description: 'Immediate out-of-hours emergency care',
  },
  {
    id: 6,
    icon: '/images/icon-6.png',
    title: 'Holistic & Therapy',
    description: 'Alternative therapies and rehabilitation',
  },
]

const SearchByAnimalType = () => {
  return (
    <section className="w-full bg-white py-16 px-6 mt-18">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-[48px] font-heading font-bold text-[#0d2e5e]">
            Search by{' '}
            <span style={{ color: '#13b8a8' }}>Animal Type</span>
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-center text-black text-[16px] font-sans  mb-12 max-w-xl font-normal mx-auto">
          Select a category to find specialized veterinary professionals tailored
          to your animal&apos;s specific needs.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
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
