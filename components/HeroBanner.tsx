import { PublicHeroBanner } from './sharedComponents/PublicHeroBanner'

const HeroBanner = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            innerLayout={false}
            rightImageSrc="/images/pet.png"
            rightImageSlides={[
                { src: '/images/pet.png', alt: 'Pet' },
                { src: '/images/about-hero.png', alt: 'Pet care' },
                { src: '/images/pet.png', alt: 'Pet' },
            ]}
            rightImageBottomClassName="bottom-6"
            showSearch
        />
    )
}

export default HeroBanner
