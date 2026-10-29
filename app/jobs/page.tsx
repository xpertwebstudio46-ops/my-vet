import { Suspense } from 'react'
import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import Footer from '@/components/Footer'
import JobsBoard from '@/components/jobs/JobsBoard'
import JobSkeleton from '@/components/jobs/JobSkeleton'

export const metadata = { title: 'Veterinary Jobs | My Vet', description: 'Find veterinary jobs across the UK. Search by role, location and employment type.' }
export default function JobsPage() {
  return <><PublicHeroBanner title={<>Find your next <span className="text-teal-400">veterinary role</span></>} description="Discover opportunities with veterinary practices across the UK, from full-time careers to flexible locum work." cta={{ href: '/vet-dashboard/jobs', label: 'Post a job' }} /><main className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><Suspense fallback={<JobSkeleton />}><JobsBoard /></Suspense></main><Footer /></>
}
