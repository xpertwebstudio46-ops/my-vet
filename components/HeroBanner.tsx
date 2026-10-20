import { PublicHeroBanner } from './sharedComponents/PublicHeroBanner'

const HeroBanner = () => {
    return (
        <PublicHeroBanner
            title="Find, compare and review veterinary practices near you"
            description="We help pet owners discover, compare, and review trusted veterinary practices so they can make informed decisions about their pets' healthcare."
            cta={{ href: '/register?role=vet', label: 'Register today' }}
            innerLayout={false}
            rightImageSrc="/images/den-1.png"
            rightImageSlides={[
                { src: '/images/goats.png', alt: 'Veterinarian holding an iguana', className: '-translate-x-[14px] pr-6 sm:pr-12 lg:pr-16' },
                { src: '/images/cow.png', alt: 'Veterinary care', className: '-translate-x-[40px] sm:-translate-x-[56px] lg:-translate-x-[42px] pr-6 sm:pr-12 lg:pr-16' },
                { src: '/images/pet.png', alt: 'Pet' },
                { src: '/images/slide-2.png', alt: 'Veterinary care' },
                { src: '/images/slide-4.png', alt: 'Veterinary practice' },
            ]}
            rightImageBottomClassName="bottom-6"
            showSearch

        />
    )
}

export default HeroBanner
