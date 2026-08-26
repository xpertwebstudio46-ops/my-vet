import Image from 'next/image'
import Link from 'next/link'
import Header from '../Header'


const SponsorHero = () => {
    return (
        <section className="relative w-full min-h-screen">

            {/* Hero background image */}
            <Image
                src="/images/hero.png"
                alt="Hero Banner"
                fill
                sizes="100vw"
                className="!h-[100%]"
                priority
            />

            {/* Paw - right top */}
            <div className="absolute top-26 right-0 z-20 pointer-events-none">
                <img src="/images/paw-2.png" alt="" className="w-full h-32 object-cover opacity-70" />
            </div>

            {/* Paw - left bottom */}
            <div className="absolute bottom-0 left-2 z-20 pointer-events-none">
                <img src="/images/paw-1.png" alt="" className="w-32 h-32 object-contain opacity-70" />
            </div>
            <div className="absolute bottom-0 left-0 z-20 pointer-events-none">
                <img src="/images/shape.png" alt="" className="w-full h-32 object-contain opacity-70" />
            </div>

            {/* Header — absolutely on top of the hero */}
            <div className="absolute top-6 left-0 right-0 z-50">
                <Header />
            </div>

            {/* Hero text content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">

                <div className=" relative w-full lg:w-[42%] pt-40 lg:pt-52">
                                    <div className="absolute top-50 -left-6 z-20 pointer-events-none">
                        <img src="/images/mek.png" alt="" className="w-18 h-18 object-contain " />
                    </div>
                    <h1 className="text-[38px] sm:text-[52px] font-extrabold text-white leading-tight mb-6">
                        Find The{' '}
                        <span style={{ color: '#13b8a8' }}>Care</span>{' '}
                        Your <br />
                        Animals Would <br />
                        Choose
                    </h1>

                    <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-md">
                        Trusted veterinary practices across the UK — reviewed by real pet
                        owners who care about animal welfare.
                    </p>

                    <Link
                        href="/register?role=vet"
                        className="inline-flex items-center border-none bg-[#13b8a8] gap-2 px-4 py-4 text-sm font-semibold border-2 rounded-full transition-colors hover:bg-[#13b8a8] hover:text-white"
                        style={{ color: '#fff' }}
                    >
                        Register Your Practice
                        <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                    </Link>
                </div>

                {/* Right side — pet image */}
                <div className="relative top-[160px] left-[60px] z-10 w-full lg:w-[60%] h-[420px] sm:h-[520px] lg:h-[620px] lg:block">
                    {/* Back shapes — behind pet */}
                    <div className="absolute top-0 left-32 z-20 pointer-events-none">
                        <img src="/images/half-right.png" alt="" className="w-6 h-6 object-contain " />
                    </div>
                    <div className="absolute top-24 left-20 z-20 pointer-events-none">
                        <img src="/images/right-shape.png" alt="" className="w-12 h-12 object-contain " />
                    </div>
                    <div className="absolute top-30 inset-0 z-0 pointer-events-none">
                        <img src="/images/back-shapes.png" alt="" className="w-full h-full object-contain object-right" />
                    </div>
                    {/* Pet — on top of back shapes */}
                    <div className="absolute bottom-6 right-4 inset-0 z-10">
                        <Image
                            src="/images/about-hero.png"
                            alt="Pet"
                            fill
                            sizes='10'
                            className="object-contain object-right"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative top-6 z-10 mt-0 px-4 sm:px-4 flex justify-center">
                <div className="w-full max-w-[76%] flex flex-col  sm:flex-row items-stretch sm:items-center bg-white p-0 sm:p-2 rounded-3xl sm:rounded-full border border-gray-300 gap-6 sm:gap-0">
                    <div className="flex flex-1 items-center gap-3 px-5 sm:px-7 bg-gray-200 sm:rounded-tl-full sm:rounded-bl-full min-h-[72px]">
                        <svg
                            className="w-5 h-5 shrink-0"
                            style={{ color: '#13b8a8' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for trusted veterinary care near you..."
                            className="flex-1 py-5 text-base text-gray-500 placeholder-gray-400 outline-none"
                        />
                    </div>
                    <button
                        className="px-8 sm:px-12 py-5 text-base font-semibold text-white sm:rounded-tr-full sm:rounded-br-full transition-opacity hover:opacity-90 whitespace-nowrap min-h-[72px]"
                        style={{ backgroundColor: '#0d2e5e' }}
                    >
                        Find a Vet
                    </button>
                </div>
            </div>

        </section>
    )
}

export default SponsorHero
