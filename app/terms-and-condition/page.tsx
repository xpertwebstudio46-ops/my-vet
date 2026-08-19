

import React from 'react'
import Header from '@/components/Header'
import TermsConditionsContent from '@/components/terms-and-condition/Terms'
import Terms from '@/components/terms-and-condition/TermHero'
import Footer from '@/components/Footer'



const page = () => {
    return (
        <>
            <div className='relative flex items-center justify-center'>
                <div className='absolute top-0 max-w-[100%] mt-5'>
                    <Header />
                </div>
                <Terms />
            </div>
            <TermsConditionsContent />
            <Footer />
        </>
    )
}

export default page
