import { CalendarDays, Images, MapPin, PhoneCall, UsersRound } from 'lucide-react'
import type { Practice } from '@/lib/api/types'

function getQualifications(value: string | null | undefined) {
  return value?.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) ?? []
}

export function PublicPracticeDetails({ practice }: { practice: Practice }) {
  const pricing = practice.pricing ?? []
  const servicePricing = pricing.filter((item) => item.kind === 'SERVICE')
  const healthPackages = pricing.filter((item) => item.kind === 'HEALTH_PACKAGE')
  const gallery = practice.galleryMedia ?? []
  const team = practice.teamMembers ?? []
  const today = new Date(new Date().toISOString().slice(0, 10))
  const holidays = (practice.holidayHours ?? []).filter((item) => new Date(item.date) >= today)
  const emergency = practice.emergencyHours

  return (
    <div className="flex flex-col gap-8">
      {pricing.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-[#0d2e5e]">Pricing</h2>
            <p className="text-sm text-slate-500">Typical fees and packages published by this practice.</p>
          </div>
          <div className="grid gap-6">
            {servicePricing.length > 0 && <PricingGroup title="Service pricing" items={servicePricing} />}
            {healthPackages.length > 0 && <PricingGroup title="Health packages" items={healthPackages} />}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-[#0d2e5e]"><Images className="size-5 text-[#13b8a8]" />Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((media) => media.mediaType === 'VIDEO' ? (
              <video key={media.id} controls className="aspect-video w-full rounded-xl border bg-black" src={media.url} />
            ) : (
              <figure key={media.id} className="overflow-hidden rounded-xl border bg-white">
                <img src={media.url} alt={media.altText ?? media.caption ?? `${practice.name} gallery image`} className="aspect-video w-full object-cover" />
                {media.caption && <figcaption className="p-3 text-sm text-slate-500">{media.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-[#0d2e5e]"><UsersRound className="size-5 text-[#13b8a8]" />Meet the team</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {team.map((member) => (
              <TeamMemberArticle key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {(emergency?.enabled || holidays.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {emergency?.enabled && (
            <article className="rounded-xl border bg-white p-5">
              <h2 className="flex items-center gap-2 font-semibold text-[#0d2e5e]"><PhoneCall className="size-5 text-[#13b8a8]" />Emergency contact</h2>
              {emergency.phone && <a href={`tel:${emergency.phone.replace(/[^+\d]/g, '')}`} className="mt-3 block font-semibold text-[#064071]">{emergency.phone}</a>}
              {emergency.calloutAddress && <p className="mt-2 flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 size-4 shrink-0 text-[#13b8a8]" />{emergency.calloutAddress}</p>}
              {emergency.instructions && <p className="mt-2 whitespace-pre-line text-sm text-slate-500">{emergency.instructions}</p>}
            </article>
          )}
          {holidays.length > 0 && (
            <article className="rounded-xl border bg-white p-5">
              <h2 className="flex items-center gap-2 font-semibold text-[#0d2e5e]"><CalendarDays className="size-5 text-[#13b8a8]" />Upcoming holiday hours</h2>
              <ul className="mt-3 space-y-2">
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="text-sm text-slate-600">
                    <strong>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(holiday.date))}</strong>
                    {' - '}
                    {holiday.isClosed ? 'Closed' : `${holiday.opensAt}-${holiday.closesAt}`}
                    {holiday.note ? ` - ${holiday.note}` : ''}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </section>
      )}
    </div>
  )
}

function TeamMemberArticle({ member }: { member: NonNullable<Practice['teamMembers']>[number] }) {
  const qualifications = getQualifications(member.qualifications)

  return (
    <article className="flex gap-4 rounded-xl border bg-white p-4">
      {member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="size-20 shrink-0 rounded-xl object-cover" /> : <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-2xl font-semibold text-teal-700">{member.name.slice(0, 1)}</span>}
      <div>
        <h3 className="font-semibold">{member.name}</h3>
        <p className="text-sm font-medium text-[#13b8a8]">{member.role}</p>
        {qualifications.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {qualifications.map((qualification, index) => (
              <span key={`${qualification}-${index}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {qualification}
              </span>
            ))}
          </div>
        )}
        {member.bio && <p className="mt-2 text-sm text-slate-600">{member.bio}</p>}
      </div>
    </article>
  )
}

function PricingGroup({ title, items }: { title: string; items: NonNullable<Practice['pricing']> }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#13b8a8]">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.section}</p>
                <h4 className="mt-1 break-words font-semibold text-slate-900">{item.name}</h4>
                {item.description ? <PricingDescription text={item.description} /> : <p className="mt-2 text-sm text-slate-500">Contact the practice for details.</p>}
              </div>
              <div className="shrink-0 rounded-lg bg-white px-3 py-2 text-left shadow-sm sm:min-w-32 sm:text-right">
                <strong className="block whitespace-nowrap text-lg text-[#064071]">{formatPrice(item.price, item.currency)}</strong>
                <span className="mt-0.5 block text-xs font-semibold uppercase text-slate-500">{vatLabel(item.vatMode ?? 'INC_VAT')}</span>
                {item.billingPeriod && item.billingPeriod !== 'ONE_OFF' && <span className="mt-0.5 block text-xs text-slate-500">{billingLabel(item.billingPeriod)}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function PricingDescription({ text }: { text: string }) {
  const isLong = text.length > 180

  return (
    <div className="mt-2 min-w-0 text-sm leading-6 text-slate-500">
      <p className={`${isLong ? 'line-clamp-3' : ''} whitespace-pre-line break-words [overflow-wrap:anywhere]`}>{text}</p>
      {isLong && (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs font-semibold text-[#064071] hover:underline">Read more</summary>
          <p className="mt-2 rounded-lg bg-white p-3 text-sm leading-6 text-slate-600 shadow-sm whitespace-pre-line break-words [overflow-wrap:anywhere]">{text}</p>
        </details>
      )}
    </div>
  )
}

function formatPrice(price: string, currency: string) {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(price))
  } catch {
    return `${currency} ${price}`
  }
}

function billingLabel(period: 'ONE_OFF' | 'MONTHLY' | 'YEARLY') {
  if (period === 'MONTHLY') return 'Billed monthly'
  if (period === 'YEARLY') return 'Billed yearly'
  return 'One off'
}

function vatLabel(mode: 'INC_VAT' | 'EX_VAT') {
  return mode === 'EX_VAT' ? 'ex VAT' : 'inc VAT'
}
