import HeroBanner from '@/components/HeroBanner'
import SearchByAnimalType from '@/components/SearchByAnimalType'
import WhyChooseUs from '@/components/WhyChooseUs'
import VetPracticeCallout from '@/components/VetPracticeCallout'
import TopRatedPractices from '@/components/TopRatedPractices'
import PricingPlans from '@/components/PricingPlans'
import Testimonials from '@/components/Testimonials'
import LogoMarquee from '@/components/LogoMarquee'
import Footer from '@/components/Footer'

const Page = () => {
  return (
    <>
      <HeroBanner />
      <SearchByAnimalType />
      <WhyChooseUs />
      <VetPracticeCallout />
      <TopRatedPractices />
      <PricingPlans />
      <Testimonials />
      <LogoMarquee />
      <Footer />
    </>
  )
}

export default Page
