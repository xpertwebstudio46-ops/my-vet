import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import PriceComparisonSection from '@/components/PriceComparisonSection'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'

export const metadata: Metadata = {
  title: 'Price Comparison | MY VET',
  description: 'Explore veterinary service prices and compare care options with My Vet.',
}

export default function PriceComparisonPage() {
  return (
    <>
      <PublicHeroBanner
        title={<>Compare veterinary <span className="text-[#13b8a8]">prices</span></>}
        description="Explore veterinary service pricing and consumer information to help you compare care options for your pets."
      />
      <PriceComparisonSection />
      <Footer />
    </>
  )
}
