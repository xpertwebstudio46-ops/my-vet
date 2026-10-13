export type PricingComparisonItem = {
  service: string;
  price: number;
  benchmarkPrice: number | null;
  isFromPrice?: boolean;
};

export const COMPARISON_THRESHOLD_PERCENT = 5;

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPricingPrice(price: number) {
  return priceFormatter.format(price);
}

export function priceDifference(item: PricingComparisonItem) {
  if (item.benchmarkPrice === null || !Number.isFinite(item.benchmarkPrice) || item.benchmarkPrice <= 0 || !Number.isFinite(item.price)) return null;
  return ((item.price - item.benchmarkPrice) / item.benchmarkPrice) * 100;
}
