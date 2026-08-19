import Image from 'next/image'
import Header from '../Header'


const Hero = () => {
    return (
        <section className="relative w-full min-h-screen">

            {/* Hero background image */}
            <Image
                src="/images/hero.png"
                alt="Hero Banner"
                fill
                sizes="100vw"
                className=""
                priority
            />

            {/* Paw - right top */}
            {/* FIX: top-26 is not a valid Tailwind class (not in default spacing scale),
                so it was being dropped silently. Using arbitrary value instead. */}
            <div className="absolute top-[104px] right-0 z-20 pointer-events-none">
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
                    {/* FIX: top-50 is not a valid Tailwind class — using arbitrary value instead */}
                    <div className="absolute top-[200px] -left-6 z-20 pointer-events-none">
                        <img src="/images/mek.png" alt="" className="w-18 h-18 object-contain " />
                    </div>
                    <h1 className="text-[58px]  font-bold font-heading text-white leading-tight mb-6">
                        Partner With

                        <span style={{ color: '#13b8a8' }}> MY VET</span>{' '}

                        & Grow Your
                        Reach
                    </h1>

                    <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-md">
                        Trusted veterinary practices across the UK — reviewed by real pet
                        owners who care about animal welfare.
                    </p>


                </div>

                {/* Right side — pet image */}
                <div className="relative top-[78px]  hidden left-[60px] z-10 w-full lg:w-[60%] h-[420px] sm:h-[520px] lg:h-[750px] lg:block">
                    {/* Back shapes — behind pet */}
                    <div className="absolute top-22 left-32 z-20 pointer-events-none">
                        <img src="/images/half-right.png" alt="" className="w-6 h-6 object-contain " />
                    </div>
                    <div className="absolute top-42 inset-0 z-1 left-20 z-20 pointer-events-none">
                        <img src="/images/right-shape.png" alt="" className="w-12 h-12 object-contain " />
                    </div>
                    {/* FIX: top-30 is not a valid Tailwind class — using arbitrary value instead */}
                    <div className="absolute top-[120px] inset-0 z-0 pointer-events-none">
                        <img src="/images/back-shapes.png" alt="" className="w-full h-full object-contain object-right" />
                    </div>
                    {/* Pet — on top of back shapes */}
                    <div className="absolute -bottom-[30px] right-4 inset-0 z-10">
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

            {/* Stats bar — replaces the old search bar */}
        

        </section>
    )
}

export default Hero;
