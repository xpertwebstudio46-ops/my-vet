import ReviewBanner from '@/components/review/reviewBanner'
import ReviewBlog from '@/components/review/reviewTestimonial'
import React from 'react'
import Footer from '@/components/Footer'

const page = () => {
  return (
    <>
       <ReviewBanner/>
         <ReviewBlog/>
         <Footer/>
    </>
  )
}

export default page
