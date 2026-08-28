import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const SponsorHero = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            innerLayout={false}
            showSearch
        />
    )
}

export default SponsorHero
