import { PublicHeroBanner } from './sharedComponents/PublicHeroBanner'

const HeroBanner = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            innerLayout={false}
            rightImageSrc="/images/den-1.png"
            rightImageSlides={[
                { src: '/images/den-1.png', alt: 'Veterinarian holding an iguana' },
                { src: '/images/den-2.png', alt: 'Veterinary care' },
                { src: '/images/pet.png', alt: 'Pet' },
            ]}
            rightImageBottomClassName="bottom-6"
            showSearch

        />
    )
}

export default HeroBanner
