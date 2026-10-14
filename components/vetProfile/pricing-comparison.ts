export type PricingComparisonItem = {
  service: string;
  price: number;
  benchmarkPrice: number | null;
  isFromPrice?: boolean;
};

export const COMPARISON_THRESHOLD_PERCENT = 5;

export const DEMO_PRICING_COMPARISON = {
  practiceLabel: "Practice price",
  benchmarkLabel: "UK average",
  sourceText: "Illustrative sample prices and averages. These are not this practice's published fees or verified market averages.",
  items: [
    { service: "Initial consultation", price: 55, benchmarkPrice: 65 },
    { service: "Annual vaccination", price: 75, benchmarkPrice: 75 },
    { service: "Dental scale and polish", price: 180, benchmarkPrice: 150 },
    { service: "Cat neutering", price: 85, benchmarkPrice: 100, isFromPrice: true },
    { service: "Microchipping", price: 25, benchmarkPrice: 30 },
    { service: "Emergency consultation", price: 140, benchmarkPrice: 120 },
  ] satisfies PricingComparisonItem[],
};

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
