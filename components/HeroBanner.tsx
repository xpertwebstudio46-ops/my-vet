import { PublicHeroBanner } from './sharedComponents/PublicHeroBanner'

const HeroBanner = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            innerLayout={false}
            rightImageSrc="/images/pet.png"
            rightImageBottomClassName="bottom-6"
            showSearch
        />
    )
}

export default HeroBanner
