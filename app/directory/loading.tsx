import HeroDirectory from '@/components/directory/HeroDirectory'
import DirectorySkeleton from '@/components/directory/DirectorySkeleton'
import Footer from '@/components/Footer'

export default function LoadingDirectory() {
  return <>
    <HeroDirectory />
    <div className="w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl min-w-0 items-start gap-6 lg:grid-cols-[260px_1fr]">
        <div aria-hidden="true" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 motion-safe:animate-pulse"><div className="h-5 w-20 rounded bg-slate-200" />{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-5 w-3/4 rounded bg-slate-100" />)}</div>
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><DirectorySkeleton /></div>
      </div>
    </div>
    <Footer />
  </>
}
