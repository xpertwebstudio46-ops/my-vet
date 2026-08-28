import Image from 'next/image'
import Link from 'next/link'

const VetPracticeCallout = () => {
  return (
    <section className="relative mx-auto mt-10 min-h-[520px] w-[94%] overflow-hidden rounded-xl bg-[#13b8a8] sm:mt-16 sm:w-[98%] lg:h-[75vh]">
      <Image
        src="/images/use.png"
        alt=""
        fill
        sizes="100vw"
        className="object-contain object-center lg:object-cover"
        priority
      />

      {/* Text content — right half */}
      <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col justify-center bg-black/20 p-6 sm:p-10 lg:right-0 lg:left-auto lg:bottom-12 lg:w-[80%] lg:bg-transparent lg:pl-[500px]">
        <h2 className="font-heading text-[32px] font-bold text-[#064071] leading-tight mb-3 sm:text-[40px]">
          Are You a
          <br />
          <span className="font-bold font-heading text-white">Veterinary</span> Practice?
        </h2>

        <p className="text-white text-[16px] leading-relaxed mb-5 max-w-lg sm:text-[18px]">
          Join My Vet to grow your visibility, attract new clients, and manage
          your online reputation in one place.
        </p>

        <Link
          href="/register?role=vet"
          className="self-start inline-flex items-center gap-2 px-6 py-3.5 font-sans text-[16px] rounded-full text-white font-normal"
          style={{ backgroundColor: '#0d2e5e' }}
        >
          Register Your Practice
          <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}



export default VetPracticeCallout
