import { ProfileBanner } from './profile-banner'
import { ProfileHeroCard } from './profile-hero-card'
import { PracticeEditor } from '../practice-editor'

export function PracticeProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileBanner />
      <ProfileHeroCard />

      <PracticeEditor heading="Public profile details" showEmergencyFields />
    </div>
  )
}
