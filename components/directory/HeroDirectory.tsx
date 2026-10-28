import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const HeroDirectory = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Vet register today' }}
            secondaryCta={{ href: '/register?role=pet-owner', label: 'Pet owner register' }}
            title={
                <>
                    Partner With <span style={{ color: '#13b8a8' }}>MY VET</span> & Grow Your
                    Reach
                </>
            }
        />
    )
}

export default HeroDirectory
