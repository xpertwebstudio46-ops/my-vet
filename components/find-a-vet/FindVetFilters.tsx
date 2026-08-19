import { filters } from '@/data/filter'
import { SlidersHorizontal } from 'lucide-react'
import React from 'react'

const FindVetFilters = () => {
    return (
        <>
            <div className='bg-white rounded-lg p-5 shadow-lg border border-gray-500/15 '>
                <div className='flex items-center gap-3'>
                    <SlidersHorizontal className='text-[#064071]' />
                    <h2 className='text-[18px] font-bold font-heading text-black'>Advanced Filters</h2>
                </div>

                {/* animal types */}
                <div className=''>                
                    <div className='space-y-3'>
                        {filters.map(
                            (filters) => (
                                <div className='mt-4' key={filters.title}>
                                    <h4 className="mb-4 font-sans font-normal text-[16px] capitalize">{filters.title}</h4>
                                    <div className='space-y-3'>
                                        {filters.options.map((option) => (
                                            <label key={option} className='flex items-center gap-4'>
                                                <input type="checkbox" />
                                                <span className='font-sans text-[#475569] text-[14px] font-normal'>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        )
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default FindVetFilters
