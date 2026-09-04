import { PublicHeroBanner } from './sharedComponents/PublicHeroBanner'

const HeroBanner = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            innerLayout={false}
            rightImageSrc="/images/pet.png"
            rightImageSlides={[
                { src: '/images/pet.png', alt: 'Pet' },
                { src: '/images/slide-2.png', alt: 'Pet care' },
                { src: '/images/slide-3.png', alt: 'Pet' },
                   { src: '/images/slide-4.png', alt: 'Pet' },
            ]}
            rightImageBottomClassName="bottom-6"
            showSearch
        />
    )
}

export default HeroBanner
