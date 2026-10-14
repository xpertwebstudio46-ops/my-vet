import { PricingConsumerInformation } from './vetProfile/PricingConsumerInformation'

export default function PriceComparisonSection() {
    return (
        <div className="w-full bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 dark:bg-slate-950">
            <div className="mx-auto min-w-0 max-w-6xl">
                <PricingConsumerInformation items={[]} />
            </div>
        </div>
    )
}
