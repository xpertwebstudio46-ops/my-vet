import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const AboutHero = () => {
    return (
        <PublicHeroBanner
            cta={{ href: '/register?role=vet', label: 'Vet register today' }}
            secondaryCta={{ href: '/register?role=pet-owner', label: 'Pet owner register' }}
            title={
                <span className="block text-[28px] leading-snug sm:text-[34px] lg:text-[38px]">
                    Vet Owners Join a Growing Community of Trusted Veterinary Practices Today and claim your <span style={{ color: '#13b8a8' }}>first 3 months free</span>
                </span>
            }
        />
    )
}

export default AboutHero
