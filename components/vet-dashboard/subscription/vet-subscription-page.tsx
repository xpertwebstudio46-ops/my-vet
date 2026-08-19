import { BillingHistoryCard } from './billing-history-card'
import { CurrentPlanCard } from './current-plan-card'
import { PaymentMethodCard } from './payment-method-card'
import { SubscriptionBanner } from './subscription-banner'

export function VetSubscriptionPage() {
  return (
    <div className="space-y-6">
      <SubscriptionBanner />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <CurrentPlanCard />
        <PaymentMethodCard />
      </div>

      <BillingHistoryCard />
    </div>
  )
}
