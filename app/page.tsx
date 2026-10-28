import HeroBanner from '@/components/HeroBanner'
import SearchByAnimalType from '@/components/SearchByAnimalType'
import WhyChooseUs from '@/components/WhyChooseUs'
import VetPracticeCallout from '@/components/VetPracticeCallout'
import TopRatedPractices from '@/components/TopRatedPractices'
import PricingPlans from '@/components/PricingPlans'
import Testimonials from '@/components/Testimonials'
import LogoMarquee from '@/components/LogoMarquee'
import Footer from '@/components/Footer'
import { InviteYourVet } from '@/components/practices/invite-your-vet'
import { getPublicReviews, getSponsorships } from '@/lib/api/server'

const Page = async () => {
  const [sponsors, reviews] = await Promise.all([
    getSponsorships().catch(() => []),
    getPublicReviews().catch(() => null),
  ])
  return (
    <>
      <HeroBanner />
      <SearchByAnimalType />
      <WhyChooseUs />
      <VetPracticeCallout />
      <TopRatedPractices />
      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <InviteYourVet />
      </div> */}
      <PricingPlans />
      <Testimonials reviews={reviews?.items ?? []} unavailable={reviews === null} />
      <LogoMarquee initialSponsors={sponsors} />
      <Footer />
    </>
  )
}

export default Page
