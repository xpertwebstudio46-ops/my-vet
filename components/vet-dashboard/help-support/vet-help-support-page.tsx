import { ContactSupportCard } from './contact-support-card'
import { FaqCard } from './faq-card'
import { HelpSupportBanner } from './help-support-banner'
import { vetFaqs, vetSupportContacts } from './help-support-data'

export function VetHelpSupportPage() {
  return (
    <div className="space-y-6">
      <HelpSupportBanner />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <FaqCard faqs={vetFaqs} />
        <ContactSupportCard contacts={vetSupportContacts} />
      </div>
    </div>
  )
}
