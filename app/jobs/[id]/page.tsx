import { PublicHeroBanner } from '@/components/sharedComponents/PublicHeroBanner'
import Footer from '@/components/Footer'
import JobDetails from '@/components/jobs/JobDetails'
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <><PublicHeroBanner title={<>Your next chapter in <span className="text-teal-400">veterinary care</span></>} description="Explore the role, meet the practice and send your application directly through My Vet." /><main className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><JobDetails id={id} /></main><Footer /></>
}
