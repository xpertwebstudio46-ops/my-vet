import React from 'react'
import AboutHero from '@/components/Sponsorship/SponsorHero'
import PricingPlans from '@/components/PricingPlans'
import WhySponsorUs from '@/components/Sponsorship/why'
import Partner from '@/components/Sponsorship/partner'
import Footer from '@/components/Footer'

const page = () => {
  return (
    <>
      <AboutHero />
       <WhySponsorUs/>
        <PricingPlans />
         <Partner />
          <Footer />
    </>
  )
}

export default page
