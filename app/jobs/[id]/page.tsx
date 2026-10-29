import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import Footer from '@/components/Footer'
import JobDetails from '@/components/jobs/JobDetails'
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <><PublicHeroBanner title={<>Your next chapter in <span className="text-teal-400">veterinary care</span></>} description="Explore the role, meet the practice and send your application directly through My Vet." /><main className="w-full bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-10 lg:py-14 2xl:px-16"><JobDetails id={id} /></main><Footer /></>
}
