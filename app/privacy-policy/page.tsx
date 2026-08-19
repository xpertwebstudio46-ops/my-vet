

import Privacy from '@/components/PrivacyPolicy/PrivacyHero'
import React from 'react'
import Header from '@/components/Header'
import PrivacyContent from '@/components/PrivacyPolicy/PrivacyContent'
import Footer from '@/components/Footer'



const page = () => {
    return (
        <>
            <div className='relative flex items-center justify-center'>
                <div className='absolute top-0 max-w-[100%] mt-5'>
                    <Header />
                </div>
                <Privacy />
            </div>
                <PrivacyContent/>
                <Footer/>
        </>
    )
}

export default page
