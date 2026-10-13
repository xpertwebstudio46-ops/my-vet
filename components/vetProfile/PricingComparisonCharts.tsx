"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DEMO_PRICING_COMPARISON, formatPricingPrice, priceDifference, type PricingComparisonItem } from "./pricing-comparison";

function formatPercentage(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function ServiceTick({ x = 0, y = 0, payload, horizontal = false }: { x?: number | string; y?: number | string; payload?: { value: string | number }; horizontal?: boolean }) {
  const words = String(payload?.value ?? "").split(" ");
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= 18) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return <g transform={`translate(${x},${y})`}><text textAnchor={horizontal ? "end" : "middle"} fill="currentColor" fontSize={11}>{lines.map((line, index) => <tspan key={index} x={0} y={(horizontal ? -(lines.length - 1) * 7 : 14) + index * 14}>{line}</tspan>)}</text></g>;
}

export function PricingComparisonCharts({ items, benchmarkLabel, practiceLabel = "This Practice" }: { items: PricingComparisonItem[]; benchmarkLabel: string; practiceLabel?: string }) {
  const chartId = useId();
  const [animationKey, setAnimationKey] = useState(0);
  const suppliedItems = items.filter((item): item is PricingComparisonItem & { benchmarkPrice: number } => item.benchmarkPrice !== null && Number.isFinite(item.benchmarkPrice) && item.benchmarkPrice > 0 && Number.isFinite(item.price));
  const chartItems = suppliedItems.length > 0 ? suppliedItems : DEMO_PRICING_COMPARISON.items;
  const averageLabel = suppliedItems.length > 0 ? benchmarkLabel : DEMO_PRICING_COMPARISON.benchmarkLabel;
  const priceLabel = suppliedItems.length > 0 ? practiceLabel : DEMO_PRICING_COMPARISON.practiceLabel;
  const differences = chartItems.map((item) => ({ ...item, difference: priceDifference(item) ?? 0 }));
  const differenceRange = Math.max(10, Math.ceil(Math.max(...differences.map((item) => Math.abs(item.difference))) / 5) * 5 + 5);
  const config = {
    price: { label: priceLabel, color: "#13b8a8" },
    benchmarkPrice: { label: averageLabel, color: "#085A9E" },
    difference: { label: "Difference", color: "#13b8a8" },
  } satisfies ChartConfig;

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => setAnimationKey((value) => value + 1)} aria-label="Replay price comparison chart animations" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#064071] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#13b8a8] dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"><RotateCcw aria-hidden="true" className="size-3.5" />Replay animation</button>
      </div>
      <div className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 id={`${chartId}-prices`} className="font-semibold text-[#0d2e5e] dark:text-slate-100">Service price comparison</h3>
        <div tabIndex={0} role="region" aria-label="Price chart, scroll horizontally to see all services" className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-[#13b8a8]">
          <ChartContainer config={config} initialDimension={{ width: Math.max(640, chartItems.length * 120), height: 360 }} className="h-[360px] w-full min-w-[640px] aspect-auto" style={{ minWidth: Math.max(640, chartItems.length * 120) }} aria-labelledby={`${chartId}-prices`}>
            <BarChart key={`prices-${animationKey}`} accessibilityLayer data={chartItems} margin={{ top: 16, right: 16, bottom: 28, left: 4 }} barGap={6}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="service" tickLine={false} axisLine={false} interval={0} height={70} tick={<ServiceTick />} />
              <YAxis tickLine={false} axisLine={false} width={60} tickFormatter={(value: number) => `£${value}`} />
              <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={<ChartTooltipContent formatter={(value, name) => <div className="flex min-w-44 justify-between gap-4"><span className="text-muted-foreground">{name === "price" ? priceLabel : averageLabel}</span><strong>{formatPricingPrice(Number(value))}</strong></div>} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="price" name="price" fill="var(--color-price)" radius={[5, 5, 0, 0]} maxBarSize={32} isAnimationActive animationDuration={1000} />
              <Bar dataKey="benchmarkPrice" name="benchmarkPrice" fill="var(--color-benchmarkPrice)" radius={[5, 5, 0, 0]} maxBarSize={32} isAnimationActive animationBegin={150} animationDuration={1000} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <div className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 id={`${chartId}-differences`} className="font-semibold text-[#0d2e5e] dark:text-slate-100">Difference from {averageLabel}</h3>
        <div className="mt-3 flex gap-4 text-xs text-slate-600 dark:text-slate-300"><span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-[#13b8a8]" />Cheaper</span><span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-orange-500" />More expensive</span></div>
        <div tabIndex={0} role="region" aria-label="Percentage comparison chart, scroll horizontally on smaller screens" className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-[#13b8a8]">
          <ChartContainer config={config} initialDimension={{ width: 640, height: Math.max(280, differences.length * 56) }} className="min-w-[640px] w-full aspect-auto" style={{ height: Math.max(280, differences.length * 56) }} aria-labelledby={`${chartId}-differences`}>
            <BarChart key={`differences-${animationKey}`} accessibilityLayer data={differences} layout="vertical" margin={{ top: 12, right: 40, bottom: 12, left: 4 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[-differenceRange, differenceRange]} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
              <YAxis type="category" dataKey="service" width={165} tickLine={false} axisLine={false} interval={0} tick={<ServiceTick horizontal />} />
              <ReferenceLine x={0} stroke="var(--muted-foreground)" />
              <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={<ChartTooltipContent formatter={(value) => <div className="flex min-w-40 justify-between gap-4"><span className="text-muted-foreground">Difference</span><strong>{formatPercentage(Number(value))}</strong></div>} />} />
              <Bar dataKey="difference" radius={4} maxBarSize={26} isAnimationActive animationDuration={1200}>
                {differences.map((item, index) => <Cell key={`${item.service}-${index}`} fill={item.difference < 0 ? "#13b8a8" : item.difference > 0 ? "#f97316" : "#94a3b8"} />)}
                <LabelList dataKey="difference" position="inside" formatter={(value) => formatPercentage(Number(value))} fill="#ffffff" fontSize={11} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
