import { Suspense } from 'react'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import Footer from '@/components/Footer'
import JobsBoard from '@/components/jobs/JobsBoard'
import JobSkeleton from '@/components/jobs/JobSkeleton'

export const metadata = { title: 'Veterinary Jobs | My Vet', description: 'Find veterinary jobs across the UK. Search by role, location and employment type.' }
const jobBannerSlides = [
  { src: '/images/AdobeStock_1640047686-removebg-preview (2).png', alt: 'Veterinary professional wearing teal scrubs', className: 'jobs-hero-cutout jobs-hero-cutout--1' },
  { src: '/images/AdobeStock_1507834134_Preview-removebg-preview.png', alt: 'Veterinary professional wearing blue scrubs', className: 'jobs-hero-cutout jobs-hero-cutout--2' },
  { src: '/images/AdobeStock_1692723900__1_-removebg-preview (1).png', alt: 'Veterinary team member wearing teal scrubs', className: 'jobs-hero-cutout jobs-hero-cutout--3' },
  { src: '/images/AdobeStock_1725984863_Preview-removebg-preview (1).png', alt: 'Veterinary professional wearing a white coat', className: 'jobs-hero-cutout jobs-hero-cutout--4' },
]

export default function JobsPage() {
  return <><PublicHeroBanner title={<>Find your next <span className="text-teal-400">veterinary role</span></>} description="Discover opportunities with veterinary practices across the UK, from full-time careers to flexible locum work." cta={{ href: '/vet-dashboard/jobs', label: 'Post a job' }} innerLayout={false} rightImageSlides={jobBannerSlides} rightImageBottomClassName="bottom-0" /><main className="w-full bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-10 lg:py-14 2xl:px-16"><Suspense fallback={<JobSkeleton />}><JobsBoard /></Suspense></main><Footer /></>
}
