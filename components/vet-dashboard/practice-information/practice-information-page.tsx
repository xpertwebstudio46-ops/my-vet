import { CredentialsCard } from './credentials-card'
import { DescriptionCard } from './description-card'
import { InformationBanner } from './information-banner'
import { LanguagesCard } from './languages-card'
import { LocationCard } from './location-card'

export function PracticeInformationPage() {
  return (
    <div className="space-y-6">
      <InformationBanner />

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <DescriptionCard />
          <LocationCard />
        </div>
        <div className="space-y-6">
          <CredentialsCard />
          <LanguagesCard />
        </div>
      </section>
    </div>
  )
}
