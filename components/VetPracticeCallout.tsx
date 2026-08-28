import Image from 'next/image'
import Link from 'next/link'

const VetPracticeCallout = () => {
  return (
    <section className="relative mx-auto mt-10 min-h-[440px] w-[94%] overflow-hidden rounded-xl bg-[#13b8a8] sm:mt-16 sm:w-[98%] lg:min-h-[520px] lg:h-[75vh]">
      <Image
        src="/images/use.png"
        alt=""
        fill
        sizes="100vw"
        className="hidden object-cover object-center lg:block"
        priority
      />
      <PawPrint className="absolute -right-10 -top-8 h-40 w-40 text-white/10 lg:hidden" />
      <PawPrint className="absolute -bottom-12 -left-8 h-48 w-48 text-white/10 lg:hidden" />
      <PawPrint className="absolute bottom-12 right-8 h-24 w-24 text-[#064071]/10 lg:hidden" />

      {/* Text content — right half */}
      <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col justify-center p-6 sm:p-10 lg:right-0 lg:left-auto lg:bottom-12 lg:w-[80%] lg:pl-[500px]">
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

function PawPrint({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="50" cy="72" rx="22" ry="18" />
      <ellipse cx="24" cy="46" rx="10" ry="13" transform="rotate(-15 24 46)" />
      <ellipse cx="40" cy="36" rx="10" ry="13" transform="rotate(-5 40 36)" />
      <ellipse cx="60" cy="36" rx="10" ry="13" transform="rotate(5 60 36)" />
      <ellipse cx="76" cy="46" rx="10" ry="13" transform="rotate(15 76 46)" />
    </svg>
  )
}
