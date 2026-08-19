import Image from 'next/image'
import Link from 'next/link'

const practices = [
  {
    id: 1,
    image: '/images/practice-1.png',
    name: 'Greenfield Veterinary Surgery',
    location: 'Manchester, UK',
    tags: ['Small Animals', 'Emergency Care', 'Surgery'],
    description:
      'It is a long established fact that a reader will be page when looking at its layout.',
    href: '/practice/greenfield-veterinary-surgery',
  },
  {
    id: 2,
    image: '/images/practice-2.png',
    name: 'Riverside Animal Clinic',
    location: 'Bristol, UK',
    tags: ['Exotics', 'Small Animals', 'Dental'],
    description:
      'It is a long established fact that a reader will be page when looking at its layout.',
    href: '/practice/riverside-animal-clinic',
  },
  {
    id: 3,
    image: '/images/practice-3.png',
    name: 'Highland Farm Vets',
    location: 'Edinburgh, UK',
    tags: ['Equine', 'Farm Animals', 'Mobile'],
    description:
      'It is a long established fact that a reader will be page when looking at its layout.',
    href: '/practice/highland-farm-vets',
  },
]

const TopRatedPractices = () => {
  return (
    <section className="py-16 px-6 bg-gray-50">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="font-heading font-extrabold text-[48px] text-[#064071] mb-3">
          Top Rated{' '}
          <span style={{ color: '#01AEAD' }}>Veterinary</span>{' '}
          Practices
        </h2>
        <p className="text-black text-[16px] font-sans font-normal leading-relaxed max-w-xl mx-auto">
          Discover highly recommended professionals in your area, vetted by our
          community of pet owners.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {practices.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
          >
            {/* Practice image */}
            <div className="relative w-full h-[220px]">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1">
              {/* Name */}
              <h3 className="font-heading font-bold text-[20px]  text-black mb-1">
                {p.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 mb-3">
                <img
                  src="/images/location.png"
                  alt=""
                  className="w-3.5 h-3.5 object-contain shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[12px] font-sans font-normal text-black   ">{p.location}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#01AEAD]/10 p-3 text-[#01AEAD]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className=" text-black font-sans text-[16px] leading-relaxed mb-5 flex-1">
                {p.description}
              </p>

              {/* Button */}
              <Link
                href={p.href}
                className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full text-[14.64px] font-normal text-white"
                style={{ backgroundColor: '#064071' }}
              >
                View Profile
                <img
                  src="/images/arrow.png"
                  alt=""
                  className="w-4 h-4 object-contain"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TopRatedPractices
