import AboutHero from '@/components/about/AboutHero'
import React from 'react'
import AboutWhyChooseUs from '@/components/about/AboutWhyChooseUs'
import HowWe from '@/components/about/HowWe'
import OurStorySection from '@/components/about/OurStory'
import AboutMissionSection from '@/components/about/AboutMission'
import TeamSection from '@/components/about/team'
import Footer from '@/components/Footer'

const page = () => {
  return (
    <>
       <AboutHero/>
       <AboutMissionSection/>
       <OurStorySection/>
       <HowWe/>
       <div className='mt-4 sm:mt-8'>

       <AboutWhyChooseUs/>
       <TeamSection/>
       </div>
       <Footer/>
    </>
  )
}

export default page
