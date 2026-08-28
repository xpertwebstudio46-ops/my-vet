import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const SponsorHero = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Register Your Practice' }}
            showSearch
        />
    )
}

export default SponsorHero
