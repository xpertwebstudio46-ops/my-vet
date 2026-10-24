import { getSponsorships } from '@/lib/api/server'
import LogoMarquee from '@/components/LogoMarquee'

export default async function Partner() {
  const sponsors = await getSponsorships().catch(() => [])

  return (
    <section className="overflow-hidden bg-white py-12 sm:py-14">
      <h2 className="mb-8 px-4 text-center text-[32px] font-bold font-heading leading-tight text-[#064071] sm:mb-10 sm:text-[40px]">
        Our Current <span className="text-teal-500">Partners</span>
      </h2>
      <LogoMarquee initialSponsors={sponsors} />
    </section>
  )
}
