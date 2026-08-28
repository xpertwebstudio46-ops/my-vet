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
    innerLayout?: boolean
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
    innerLayout = true,
}: PublicHeroBannerProps) {
    const textColumnClassName = innerLayout ? 'lg:w-[46%]' : 'lg:w-[42%]'
    const imageGroupClassName = innerLayout
        ? 'absolute bottom-0 right-0 z-10 h-[300px] w-full sm:h-[410px] lg:right-[-24px] lg:h-[640px] lg:w-[62%] xl:right-[-48px] xl:w-[64%]'
        : 'absolute bottom-0 right-[-42px] z-10 h-[320px] w-[115%] sm:right-[-50px] sm:h-[430px] lg:right-[-60px] lg:h-[620px] lg:w-[60%]'

    return (
        <section className={`relative w-full h-[720px] sm:h-[760px] lg:h-auto lg:aspect-[1920/1080] ${showSearch ? 'mb-24 sm:mb-16' : ''}`}>
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src="/images/hero.png"
                    alt="Hero Banner"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />

                <div className="absolute top-[92px] right-0 z-20 pointer-events-none sm:top-26">
                    <img src="/images/paw-2.png" alt="" className="h-20 w-full object-cover opacity-70 sm:h-32" />
                </div>

                <div className="absolute bottom-0 left-2 z-20 pointer-events-none">
                    <img src="/images/paw-1.png" alt="" className="h-20 w-20 object-contain opacity-70 sm:h-32 sm:w-32" />
                </div>
                <div className="absolute bottom-0 left-0 z-20 pointer-events-none">
                    <img src="/images/shape.png" alt="" className="h-20 w-full object-contain opacity-70 sm:h-32" />
                </div>

                <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                    <div className={`relative w-full pt-32 sm:pt-40 ${textColumnClassName} lg:pt-52`}>
                        <div className="absolute top-[128px] -left-3 z-20 pointer-events-none sm:top-50 sm:-left-6">
                            <img src="/images/mek.png" alt="" className="h-12 w-12 object-contain sm:h-18 sm:w-18" />
                        </div>
                        <h1 className="max-w-[520px] text-[32px] font-extrabold leading-tight text-white sm:text-[36px] lg:text-[40px] mb-4 sm:mb-6">
                            {title}
                        </h1>

                        <p className="max-w-md text-sm leading-relaxed text-blue-200 mb-6 sm:mb-8">
                            {description}
                        </p>

                        {cta ? (
                            <Link
                                href={cta.href}
                                className="inline-flex items-center border-none bg-[#13b8a8] gap-2 px-4 py-3 text-sm font-semibold border-2 rounded-full transition-colors hover:bg-[#13b8a8] hover:text-white sm:py-4"
                                style={{ color: '#fff' }}
                            >
                                {cta.label}
                                <img src="/images/arrow.png" alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
                            </Link>
                        ) : null}
                    </div>

                    <div className={imageGroupClassName}>
                        <div className="absolute top-4 left-[42%] z-20 pointer-events-none sm:top-0 sm:left-32">
                            <img src="/images/half-right.png" alt="" className="w-6 h-6 object-contain " />
                        </div>
                        <div className="absolute top-16 left-[28%] z-20 pointer-events-none sm:top-24 sm:left-20">
                            <img src="/images/right-shape.png" alt="" className="h-9 w-9 object-contain sm:h-12 sm:w-12" />
                        </div>
                        <div className={`absolute inset-0 z-0 pointer-events-none ${innerLayout ? 'top-10 sm:top-20 lg:top-10' : 'top-16 sm:top-30'}`}>
                            <img src="/images/back-shapes.png" alt="" className={`w-full h-full object-contain ${innerLayout ? 'object-center lg:object-right' : 'object-right'}`} />
                        </div>
                        <div className={`absolute ${rightImageBottomClassName} ${innerLayout ? 'right-0 lg:right-8 xl:right-14' : 'right-4'} inset-0 z-10`}>
                            <Image
                                src={rightImageSrc}
                                alt={rightImageAlt}
                                fill
                                sizes="(min-width: 1024px) 60vw, 100vw"
                                className={`object-contain ${innerLayout ? 'object-center lg:object-right' : 'object-right'}`}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 left-0 right-0 z-50 sm:top-6">
                <Header />
            </div>

            {showSearch ? (
                <div className="absolute bottom-[-76px] left-0 right-0 z-30 px-4 sm:bottom-[-41px] sm:px-4 flex justify-center">
                    <form action="/vet-search" className="w-full max-w-[94%] flex flex-col sm:max-w-[76%] sm:flex-row items-stretch sm:items-center bg-white p-1 sm:p-2 rounded-2xl sm:rounded-full border border-gray-300 gap-2 sm:gap-0">
                        <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-xl bg-gray-200 px-4 sm:min-h-[72px] sm:rounded-tl-full sm:rounded-bl-full sm:rounded-r-none sm:px-7">
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
                                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-500 placeholder-gray-400 outline-none sm:py-5 sm:text-base"
                            />
                        </div>
                        <button
                            type="submit"
                            className="min-h-[54px] rounded-xl px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:min-h-[72px] sm:rounded-tr-full sm:rounded-br-full sm:rounded-l-none sm:px-12 sm:py-5 sm:text-base whitespace-nowrap"
                            style={{ backgroundColor: '#0d2e5e' }}
                        >
                            Find a Vet
                        </button>
                    </form>
                </div>
            ) : null}

            {stats ? (
                <div className="absolute bottom-4 left-0 right-0 z-30 px-3 sm:bottom-8 sm:px-4 flex justify-center">
                    <div className="relative w-full px-0 sm:px-10 sm:py-7">
                        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col bg-white rounded-2xl p-3 shadow-lg items-center justify-center sm:rounded-3xl sm:p-8"
                                >
                                    <Image
                                        src={stat.image}
                                        alt={stat.label}
                                        width={50}
                                        height={50}
                                        className="mb-2 h-9 w-9 object-contain sm:mb-3 sm:h-[50px] sm:w-[50px]"
                                    />
                                    <span className="text-[12px] font-bold font-sans text-[#064071] sm:text-[16px]">
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
