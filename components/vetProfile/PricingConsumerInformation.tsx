import { Info, Minus, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { PricingComparisonCharts } from "./PricingComparisonCharts";
import { COMPARISON_THRESHOLD_PERCENT, DEMO_PRICING_COMPARISON, formatPricingPrice, priceDifference, type PricingComparisonItem } from "./pricing-comparison";

export function PricingConsumerInformation({ items, benchmarkLabel = "Average", sourceText }: { items: PricingComparisonItem[]; benchmarkLabel?: string; sourceText?: string | null }) {
  const isDemo = !items.some((item) => item.benchmarkPrice !== null && Number.isFinite(item.benchmarkPrice) && item.benchmarkPrice > 0);
  const displayItems = isDemo ? DEMO_PRICING_COMPARISON.items : items;
  const displayBenchmarkLabel = isDemo ? DEMO_PRICING_COMPARISON.benchmarkLabel : benchmarkLabel;
  const practiceLabel = isDemo ? DEMO_PRICING_COMPARISON.practiceLabel : "This Practice";
  const displaySourceText = isDemo ? DEMO_PRICING_COMPARISON.sourceText : sourceText;
  return (
    <section id="pricing-consumer-information" aria-label="Pricing & Consumer Information" className="w-full min-w-0 max-w-full break-words rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-5 text-xl font-bold text-[#0d2e5e] sm:text-2xl dark:text-slate-100">Pricing &amp; Consumer Information</h2>
      {isDemo && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><strong className="block">Demo comparison</strong><p className="mt-1">{DEMO_PRICING_COMPARISON.sourceText}</p></div>}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#13b8a8]/20 bg-[#eafaf8] p-4 dark:bg-teal-950">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#13b8a8]" />
        <div className="min-w-0"><h3 className="text-sm font-semibold text-[#0d2e5e] dark:text-teal-100">CMA Price Transparency</h3><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Prices are displayed in compliance with the Competition &amp; Markets Authority (CMA) Veterinary Market Investigation Order. All prices are indicative and include VAT where applicable.</p></div>
      </div>
      <PricingComparisonCharts items={displayItems} benchmarkLabel={displayBenchmarkLabel} practiceLabel={practiceLabel} />
      <h3 className="mt-6 mb-3 font-semibold text-[#0d2e5e] dark:text-slate-100">{isDemo ? "Example service prices" : "Published service prices"}</h3>
      <div tabIndex={0} role="region" aria-label="Service pricing comparison table, scroll horizontally on smaller screens" className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200 focus-visible:outline-2 focus-visible:outline-[#13b8a8] dark:border-slate-700">
        <table aria-label="Practice service prices and benchmark comparisons" className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-[#0d2e5e] dark:bg-slate-800 dark:text-slate-100"><tr>{["Service", practiceLabel, displayBenchmarkLabel, "Comparison"].map((label, index) => <th key={index} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayItems.map((item, index) => {
              const difference = priceDifference(item);
              const below = difference !== null && difference <= -COMPARISON_THRESHOLD_PERCENT;
              const above = difference !== null && difference >= COMPARISON_THRESHOLD_PERCENT;
              const Icon = below ? TrendingDown : above ? TrendingUp : Minus;
              return <tr key={`${item.service}-${index}`}>
                <th scope="row" className="max-w-64 break-words px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{item.service}</th>
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#064071] dark:text-slate-100">{item.isFromPrice ? "From " : ""}{formatPricingPrice(item.price)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500 dark:text-slate-300">{item.benchmarkPrice === null ? "—" : formatPricingPrice(item.benchmarkPrice)}</td>
                <td className="px-4 py-4">{difference !== null && <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${below ? "bg-[#eafaf8] text-teal-700 dark:bg-teal-950 dark:text-teal-300" : above ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}><Icon aria-hidden="true" className="size-3.5" />{below ? "Below average" : above ? "Above average" : "Average"}</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {displaySourceText && <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800 dark:text-slate-300"><Info aria-hidden="true" className="size-4 shrink-0" /><p className="whitespace-pre-line">{displaySourceText}</p></div>}
    </section>
  );
}
