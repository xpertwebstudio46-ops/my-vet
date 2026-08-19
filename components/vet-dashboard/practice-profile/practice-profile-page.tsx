import { PracticeDetailsCard } from './practice-details-card'
import { ProfileBanner } from './profile-banner'
import { ProfileHeroCard } from './profile-hero-card'
import { SocialMediaCard } from './social-media-card'

export function PracticeProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileBanner />
      <ProfileHeroCard />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <PracticeDetailsCard />
        <SocialMediaCard />
      </section>
    </div>
  )
}
