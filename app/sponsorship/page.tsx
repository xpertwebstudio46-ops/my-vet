import StayConnectedSection from '@/components/contact/ContactForm'
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
       <div id="sponsorship-enquiry" className="scroll-mt-24">
         <StayConnectedSection initialSubject="Sponsorship enquiry" />
       </div>
        <PricingPlans />
         <Partner />
          <Footer />
    </>
  )
}

export default page
