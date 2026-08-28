import { PublicHeroBanner } from '../sharedComponents/PublicHeroBanner'

const registerStats = [
    {
        image: '/images/back-1.png',
        label: 'More Visibility',
    },
    {
        image: '/images/back-2.png',
        label: 'Customer Reviews',
    },
    {
        image: '/images/back-3.png',
        label: 'Analytics Dashboard',
    },
    {
        image: '/images/back-4.png',
        label: 'More Enquiries',
    },
    {
        image: '/images/back-5.png',
        label: 'Nationwide Reach',
    },
]

const RegisterHero = () => {
    return (
        <PublicHeroBanner
            title={
                <>
                    Partner With <span style={{ color: '#13b8a8' }}>MY VET</span> & Grow Your
                    Reach
                </>
            }
            stats={registerStats}
        />
    )
}

export default RegisterHero
