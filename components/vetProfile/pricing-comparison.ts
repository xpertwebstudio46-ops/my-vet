export type PricingComparisonItem = {
  service: string;
  price: number;
  benchmarkPrice: number | null;
  isFromPrice?: boolean;
};

export const COMPARISON_THRESHOLD_PERCENT = 5;

export function formatPricingPrice(price: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

export function priceDifference(item: PricingComparisonItem) {
  return item.benchmarkPrice !== null && item.benchmarkPrice > 0 ? ((item.price - item.benchmarkPrice) / item.benchmarkPrice) * 100 : null;
}
