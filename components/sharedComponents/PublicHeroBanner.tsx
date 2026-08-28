import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../Header'

type HeroStat = {
    image: string
    label: string
}

type PublicHeroBannerProps = {
    title?: ReactNode
    description?: string
    cta?: {
        href: string
        label: string
    }
    showSearch?: boolean
    stats?: HeroStat[]
    rightImageSrc?: string
    rightImageAlt?: string
    rightImageBottomClassName?: string
}

const defaultDescription =
    'Trusted veterinary practices across the UK - reviewed by real pet owners who care about animal welfare.'

const defaultTitle = (
    <>
        Find The{' '}
        <span style={{ color: '#13b8a8' }}>Care</span>{' '}
        Your <br />
        Animals Would <br />
        Choose
    </>
)

export function PublicHeroBanner({
    title = defaultTitle,
    description = defaultDescription,
    cta,
    showSearch = false,
    stats,
    rightImageSrc = '/images/about-hero.png',
    rightImageAlt = 'Pet',
    rightImageBottomClassName = 'bottom-0',
}: PublicHeroBannerProps) {
    return (
        <section className="relative w-full aspect-[1920/1080]">
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src="/images/hero.png"
                    alt="Hero Banner"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />

                <div className="absolute top-26 right-0 z-20 pointer-events-none">
                    <img src="/images/paw-2.png" alt="" className="w-full h-32 object-cover opacity-70" />
                </div>

                <div className="absolute bottom-0 left-2 z-20 pointer-events-none">
                    <img src="/images/paw-1.png" alt="" className="w-32 h-32 object-contain opacity-70" />
                </div>
                <div className="absolute bottom-0 left-0 z-20 pointer-events-none">
                    <img src="/images/shape.png" alt="" className="w-full h-32 object-contain opacity-70" />
                </div>

                <div className="absolute top-6 left-0 right-0 z-50">
                    <Header />
                </div>

                <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className=" relative w-full lg:w-[42%] pt-40 lg:pt-52">
                        <div className="absolute top-50 -left-6 z-20 pointer-events-none">
                            <img src="/images/mek.png" alt="" className="w-18 h-18 object-contain " />
                        </div>
                        <h1 className="text-[52px]  font-extrabold text-white leading-tight mb-6">
                            {title}
                        </h1>

                        <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-md">
                            {description}
                        </p>

                        {cta ? (
                            <Link
                                href={cta.href}
                                className="inline-flex items-center border-none bg-[#13b8a8] gap-2 px-4 py-4 text-sm font-semibold border-2 rounded-full transition-colors hover:bg-[#13b8a8] hover:text-white"
                                style={{ color: '#fff' }}
                            >
                                {cta.label}
                                <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                            </Link>
                        ) : null}
                    </div>

                    <div className="absolute bottom-0 right-[-60px] z-10 w-full lg:w-[60%] h-[420px] sm:h-[520px] lg:h-[620px] lg:block">
                        <div className="absolute top-0 left-32 z-20 pointer-events-none">
                            <img src="/images/half-right.png" alt="" className="w-6 h-6 object-contain " />
                        </div>
                        <div className="absolute top-24 left-20 z-20 pointer-events-none">
                            <img src="/images/right-shape.png" alt="" className="w-12 h-12 object-contain " />
                        </div>
                        <div className="absolute top-30 inset-0 z-0 pointer-events-none">
                            <img src="/images/back-shapes.png" alt="" className="w-full h-full object-contain object-right" />
                        </div>
                        <div className={`absolute ${rightImageBottomClassName} right-4 inset-0 z-10`}>
                            <Image
                                src={rightImageSrc}
                                alt={rightImageAlt}
                                fill
                                sizes="(min-width: 1024px) 60vw, 100vw"
                                className="object-contain object-right"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showSearch ? (
                <div className="absolute bottom-[-41px] left-0 right-0 z-30 px-4 sm:px-4 flex justify-center">
                    <form action="/vet-search" className="w-full max-w-[76%] flex flex-col sm:flex-row items-stretch sm:items-center bg-white p-0 sm:p-2 rounded-3xl sm:rounded-full border border-gray-300 gap-6 sm:gap-0">
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
                                type="search"
                                name="q"
                                placeholder="Search for trusted veterinary care near you..."
                                className="flex-1 py-5 text-base text-gray-500 placeholder-gray-400 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 sm:px-12 py-5 text-base font-semibold text-white sm:rounded-tr-full sm:rounded-br-full transition-opacity hover:opacity-90 whitespace-nowrap min-h-[72px]"
                            style={{ backgroundColor: '#0d2e5e' }}
                        >
                            Find a Vet
                        </button>
                    </form>
                </div>
            ) : null}

            {stats ? (
                <div className="absolute bottom-8 left-0 right-0 z-30 px-4 sm:px-4 flex justify-center">
                    <div className="relative w-full px-6 sm:px-10 sm:py-7">
                        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col bg-white rounded-3xl p-8 shadow-lg items-center justify-center"
                                >
                                    <Image
                                        src={stat.image}
                                        alt={stat.label}
                                        width={50}
                                        height={50}
                                        className="mb-3 object-contain"
                                    />
                                    <span className="text-[16px] font-bold font-sans text-[#064071]">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    )
}
