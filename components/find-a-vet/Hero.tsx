import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const Hero = () => {
    return (
        <PublicHeroBanner
            title={
                <>
                    Partner With <span style={{ color: '#13b8a8' }}>MY VET</span> & Grow Your
                    Reach
                </>
            }
        />
    )
}

export default Hero
