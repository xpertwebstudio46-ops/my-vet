import Link from 'next/link'

const VetPracticeCallout = () => {
  return (
    <section
      className="relative overflow-hidden w-[98%] rounded-xl mx-auto h-[75vh] mt-16"
      style={{
        backgroundImage: "url('/images/use.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
     
     

      {/* Text content — right half */}
      <div className="absolute right-0 top-0 bottom-12 z-10 w-[80%] flex flex-col justify-center pl-[500px]">
        <h2 className="font-heading text-[48px] font-bold text-[#064071] leading-tight mb-3">
          Are You a
          <br />
          <span className="font-bold font-heading text-white">Veterinary</span> Practice?
        </h2>

        <p className="text-white text-[18px] leading-relaxed mb-5 max-w-lg">
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
