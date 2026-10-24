import HeroBanner from '@/components/HeroBanner'
import SearchByAnimalType from '@/components/SearchByAnimalType'
import WhyChooseUs from '@/components/WhyChooseUs'
import VetPracticeCallout from '@/components/VetPracticeCallout'
import TopRatedPractices from '@/components/TopRatedPractices'
import PricingPlans from '@/components/PricingPlans'
import PriceComparisonSection from '@/components/PriceComparisonSection'
import Testimonials from '@/components/Testimonials'
import LogoMarquee from '@/components/LogoMarquee'
import Footer from '@/components/Footer'
import { InviteYourVet } from '@/components/practices/invite-your-vet'
import { getSponsorships } from '@/lib/api/server'

const Page = async () => {
  const sponsors = await getSponsorships().catch(() => [])
  return (
    <>
      <HeroBanner />
      <SearchByAnimalType />
      <WhyChooseUs />
      <VetPracticeCallout />
      <TopRatedPractices />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <InviteYourVet />
      </div>
      <PricingPlans />
      <PriceComparisonSection />
      <Testimonials />
      <LogoMarquee initialSponsors={sponsors} />
      <Footer />
    </>
  )
}

export default Page
