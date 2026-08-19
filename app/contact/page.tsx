

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Contact from '@/components/contact/ContactBanner'
import StayConnectedSection from '@/components/contact/ContactForm'



const page = () => {
    return (
        <>
            <div className='relative flex items-center justify-center'>
                <div className='absolute top-0 max-w-[100%] mt-5'>
                    <Header />
                </div>
                <Contact />
            </div>
            <StayConnectedSection />
            <Footer />
        </>
    )
}

export default page
