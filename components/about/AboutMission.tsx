import Image from "next/image";


export default function AboutMissionSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-14">
      <div className="max-w-[90%] mx-auto">
        {/* Badge */}
        <span className="inline-flex items-center rounded-full border border-[#10B7A6] px-5 py-2 text-[12px] font-medium text-[#01AEAD]">
          About My Vet
        </span>

        {/* Heading */}
        <h2 className="mt-5 max-w-5xl text-[32px] font-bold font-heading leading-tight text-[#064071] sm:text-[40px]">
          Providing the perfect platform for vet practices and
          <br />
          <span className="text-[#01AEAD]">pet owners</span> to discover each other
        </h2>

        {/* Content */}
        <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          {/* Left Image */}
          <div className="relative h-[420px] overflow-hidden rounded-3xl sm:h-[540px] lg:h-full lg:min-h-[640px] lg:self-stretch">
            <Image
              src="/images/mission.png"
              alt="Veterinarian with Dog"
              fill
              sizes="(max-width: 1024px) 90vw, 48vw"
              className="object-cover"
            />
          </div>

          {/* Right Content */}
          <div>
            <h3 className="text-[28px] font-bold text-black sm:text-[36px]">
              Our Mission
            </h3>

            <div className="mt-5 space-y-5 text-sm font-sans leading-7 text-[#4E4E4E]">
            <p>
              Our mission is to become the UK’s leading veterinary and pet owner directory a trusted platform where people can review, compare, and find the dedicated care their pets deserve.
            </p>
            <p>
                For pet owners, My Vet makes it simple to create your very own unique online pet profile for your pets and search and create a shortlist of your most favoured vets specific for the pets you have such as exotic pets, equine or household pets, search locally.
              </p>
              <p>
                Store your favourite vet, by location, specialism and compare prices and options, it also provides you with the ability to access and write real reviews and experiences from other owners helping every family make confident, informed decisions about their animal’s well being.
              </p>
            <p>
              Together, our aim is to build a transparent, modern, and community driven space that connects pet owners with the right veterinary care, every time
            </p>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
