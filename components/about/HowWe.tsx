import Image from "next/image";



const benefits = [
  'Verified veterinary practices',
  'Invite your Vet Practice',
  'Write and read genuine reviews from real pet owners',
  'Transparent vet prices and services',
  'Transparency on group-owned and independent vets',
  'Search by vet specialism: small animal, equine, farm and exotic vets',
  'Nationwide coverage across the UK',
  'Search by location, price and review, and save your favourite vet practice',
  'Easy side-by-side comparison of vets near you, by price, specialism and location',
];

function CheckIcon() {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "#e6f7f5" }}
    >
      <svg
        className="h-3.5 w-3.5"
        style={{ color: "#13b8a8" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </span>
  );
}

export default function HowWe() {
  return (
    <section className="py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[90%]">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="flex flex-col items-center gap-2">

            {/* Top Wave */}
            <svg
              viewBox="0 0 180 12"
              className="w-30 h-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 6
                  Q10 0 20 6
                  T40 6
                  T60 6
                  T80 6
                  T100 6
                  T120 6
                  T140 6
                  T160 6
                  T180 6"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 8"
              />
            </svg>

            {/* Badge */}
            <div className="flex items-center gap-2">
              <Image
                src="/images/bones.png"
                alt=""
                width={400}
                height={400}
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-[#13b8a8]">
                How We Help
              </span>
            </div>

            {/* Bottom Wave */}
            <svg
              viewBox="0 0 180 12"
              className="w-30 h-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 6
                  Q10 0 20 6
                  T40 6
                  T60 6
                  T80 6
                  T100 6
                  T120 6
                  T140 6
                  T160 6
                  T180 6"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 8"
              />
            </svg>

          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0d2e5e]">
            Why Pet Owners and Vets Use My Vet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Find, compare and connect with trusted veterinary practices near you
          </p>
        </div>

        {/* Content */}
        <div className="relative grid lg:grid-cols-2 gap-8 items-start">
          {/* Left — vet image */}
          <div className="relative w-full h-[400px] sm:h-[520px] lg:h-auto lg:min-h-[620px] lg:self-stretch rounded-[24px] overflow-hidden">
            <Image
              src="/images/picture1.png"
              alt="Vets grooming a dog"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right — step cards */}
          <div className="flex min-w-0 flex-col gap-4">
            {Array.from({ length: Math.ceil(benefits.length / 2) }, (_, index) => (
              <div key={index} className="relative rounded-[20px] bg-[#f4f5f7]">
                <svg width="64" height="52" viewBox="0 0 64 52" aria-hidden="true" className="pointer-events-none absolute right-0 top-0">
                  <path d="M0 0H64V52Q64 36 48 36H36Q20 36 20 20V16Q20 0 4 0Z" fill="white" />
                </svg>
                <span className="absolute top-1 right-2 flex h-6 w-7 items-center justify-center text-sm font-bold text-[#0d2e5e]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <ul className="space-y-3 p-5 pr-[72px] text-sm sm:text-base font-medium leading-relaxed text-[#0d2e5e]">
                  {benefits.slice(index * 2, index * 2 + 2).map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckIcon />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Decorative cat illustration — overlaps bottom-right of the image / step 3 */}
          <div className="hidden sm:block absolute -bottom-10 right-6  w-23 h-42 pointer-events-none">
            <Image
              src="/images/shape-cat.png"
              alt=""
              fill
              sizes="100px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
