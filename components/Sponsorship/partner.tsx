import { getSponsorships } from '@/lib/api/server'

export default async function Partner() {
  const sponsors = await getSponsorships()

  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-14">
      <h2 className="mb-8 text-center text-[32px] font-bold font-heading leading-tight text-[#064071] sm:mb-10 sm:text-[40px]">
        Our Current <span className="text-teal-500">Partners</span>
      </h2>
      {sponsors.length ? (
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl ?? '#'}
              target={sponsor.websiteUrl ? '_blank' : undefined}
              rel={sponsor.websiteUrl ? 'noreferrer' : undefined}
              className="flex min-h-40 flex-col items-center justify-center rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              {sponsor.imageUrl ? (
                <img src={sponsor.imageUrl} alt={`${sponsor.name} logo`} className="h-20 max-w-full object-contain" />
              ) : (
                <span className="text-xl font-semibold text-[#064071]">{sponsor.name}</span>
              )}
              {sponsor.description ? <p className="mt-4 text-sm text-slate-500">{sponsor.description}</p> : null}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">Current sponsorships will appear here.</p>
      )}
    </section>
  )
}
