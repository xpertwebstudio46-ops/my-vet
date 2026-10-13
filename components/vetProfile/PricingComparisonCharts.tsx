"use client";

import { useId, useState } from "react";
import { formatPricingPrice, priceDifference, type PricingComparisonItem } from "./pricing-comparison";

export function PricingComparisonCharts({ items, benchmarkLabel }: { items: PricingComparisonItem[]; benchmarkLabel: string }) {
  const chartId = useId();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const comparable = items.filter((item): item is PricingComparisonItem & { benchmarkPrice: number } => item.benchmarkPrice !== null && Number.isFinite(item.benchmarkPrice) && item.benchmarkPrice >= 0);
  if (!comparable.length) {
    const message = items.length === 0 ? "Charts will appear when service prices and comparison data are available." : "Comparison data is not available yet. Published service prices are listed below.";
    return (
      <div className="grid gap-6">
        <EmptyComparisonChart title="Service price comparison" benchmarkLabel={benchmarkLabel} message={message} />
        <EmptyComparisonChart title={`Difference from ${benchmarkLabel}`} benchmarkLabel={benchmarkLabel} message={message} diverging />
      </div>
    );
  }

  const maximum = Math.max(1, ...comparable.flatMap((item) => [item.price, item.benchmarkPrice]));
  const scale = Math.ceil(maximum / 5) * 5;
  const width = Math.max(520, comparable.length * 150 + 80);
  const columnWidth = (width - 80) / comparable.length;
  const labelHeight = Math.max(60, ...comparable.map((item) => Math.ceil(item.service.length / 15) * 16 + 16));
  const differences = comparable.flatMap((item) => {
    const difference = priceDifference(item);
    return difference === null ? [] : [{ ...item, difference }];
  });
  const range = Math.max(10, ...differences.map((item) => Math.abs(item.difference)));
  const focusClass = "outline-none focus:stroke-[#0d2e5e] focus:stroke-2 dark:focus:stroke-white";

  return (
    <div className="grid gap-6">
      <div>
        <h3 id={`${chartId}-prices`} className="font-semibold text-[#0d2e5e] dark:text-slate-100">Service price comparison</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-[#13b8a8]" />This Practice</span>
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-[#085A9E]" />{benchmarkLabel}</span>
        </div>
        <p aria-live="polite" className="mt-3 min-h-10 text-xs leading-5 text-slate-600 dark:text-slate-300">{tooltip ?? "Hover over or focus a bar to see the exact price."}</p>
        <div tabIndex={0} role="region" aria-label="Service price comparison chart, scroll horizontally to see all services" className="overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-[#13b8a8]">
          <svg width={width} height={220 + labelHeight} role="group" aria-labelledby={`${chartId}-prices`} aria-label={`Grouped bar chart comparing this practice with ${benchmarkLabel}`} className="text-slate-500 dark:text-slate-400">
            {[0, 1, 2, 3, 4].map((tick) => {
              const y = 210 - tick * 45;
              return <g key={tick}><line x1={75} x2={width} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.15} /><text x={68} y={y + 4} textAnchor="end" fontSize={11} fill="currentColor">£{new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(scale * tick / 4)}</text></g>;
            })}
            {comparable.map((item, index) => {
              const center = 80 + columnWidth * (index + 0.5);
              return <g key={`${item.service}-${index}`}>
                {[{ value: item.price, label: "This Practice", color: "#13b8a8", x: center - 33 }, { value: item.benchmarkPrice, label: benchmarkLabel, color: "#085A9E", x: center + 3 }].map((bar, barIndex) => {
                  const description = `${item.service}: ${bar.label}, ${barIndex === 0 && item.isFromPrice ? "From " : ""}${formatPricingPrice(bar.value)}`;
                  const height = Math.max(2, bar.value / scale * 180);
                  return <rect key={barIndex} x={bar.x} y={210 - height} width={30} height={height} rx={3} fill={bar.color} tabIndex={0} role="img" aria-label={description} className={focusClass} onMouseEnter={() => setTooltip(description)} onMouseLeave={() => setTooltip(null)} onFocus={() => setTooltip(description)} onBlur={() => setTooltip(null)}><title>{description}</title></rect>;
                })}
                <foreignObject x={center - columnWidth / 2 + 6} y={220} width={columnWidth - 12} height={labelHeight}><div className="break-words text-center text-xs leading-4 text-slate-600 dark:text-slate-300">{item.service}</div></foreignObject>
              </g>;
            })}
          </svg>
        </div>
      </div>
      {differences.length > 0 && <div>
        <h3 id={`${chartId}-difference`} className="font-semibold text-[#0d2e5e] dark:text-slate-100">Difference from {benchmarkLabel}</h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Teal: cheaper · Orange: more expensive</p>
        <div className="mt-4 grid gap-4">
          {differences.map((item, index) => {
            const description = `${item.service}: ${item.difference > 0 ? "+" : ""}${item.difference.toFixed(1)}% compared with ${benchmarkLabel}`;
            const length = Math.abs(item.difference) / range * 100;
            return <div key={`${item.service}-${index}`}>
              <p className="mb-1 break-words text-xs font-medium text-slate-600 dark:text-slate-300">{item.service}</p>
              <svg viewBox="0 0 300 36" className="w-full" role="group" aria-label={description}>
                <line x1={150} x2={150} y1={0} y2={36} stroke="currentColor" className="text-slate-400" />
                <rect x={item.difference < 0 ? 150 - length : 150} y={7} width={Math.max(2, length)} height={22} rx={3} fill={item.difference < 0 ? "#13b8a8" : item.difference > 0 ? "#f97316" : "#94a3b8"} tabIndex={0} role="img" aria-label={description} className={focusClass}><title>{description}</title></rect>
                <text x={length >= 50 ? (item.difference < 0 ? 150 - length / 2 : 150 + length / 2) : item.difference < 0 ? 156 : 144} y={23} textAnchor={length >= 50 ? "middle" : item.difference < 0 ? "start" : "end"} fontSize={12} fill={length >= 50 ? "#ffffff" : "currentColor"} className="text-slate-600 dark:text-slate-300">{item.difference > 0 ? "+" : ""}{item.difference.toFixed(1)}%</text>
              </svg>
            </div>;
          })}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">0% = {benchmarkLabel}</p>
        </div>
      </div>}
    </div>
  );
}

function EmptyComparisonChart({ title, benchmarkLabel, message, diverging = false }: { title: string; benchmarkLabel: string; message: string; diverging?: boolean }) {
  return (
    <div role="region" aria-label={`${title}: no comparison data available`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="font-semibold text-[#0d2e5e] dark:text-slate-100">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-[#13b8a8]" />{diverging ? "Cheaper" : "This Practice"}</span>
        <span className="flex items-center gap-2"><span aria-hidden="true" className={`size-3 rounded-sm ${diverging ? "bg-orange-500" : "bg-[#085A9E]"}`} />{diverging ? "More expensive" : benchmarkLabel}</span>
      </div>
      <div className="relative mt-4 h-52 text-slate-300 dark:text-slate-600">
        <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="none" className="h-full w-full">
          {[40, 80, 120, 160].map((y) => <line key={y} x1={28} x2={390} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.5} />)}
          <line x1={diverging ? 210 : 28} x2={diverging ? 210 : 28} y1={15} y2={175} stroke="currentColor" />
          <line x1={28} x2={390} y1={175} y2={175} stroke="currentColor" />
        </svg>
        <span aria-hidden="true" className="absolute left-0 top-0 text-xs text-slate-500 dark:text-slate-400">{diverging ? "%" : "£"}</span>
        <div className="absolute inset-0 flex items-center justify-center px-8"><p className="max-w-xs rounded-lg bg-white/95 p-3 text-center text-sm leading-relaxed text-slate-500 dark:bg-slate-900/95 dark:text-slate-300">{message}</p></div>
        <span aria-hidden="true" className="absolute bottom-0 inset-x-0 text-center text-xs text-slate-500 dark:text-slate-400">{diverging ? `0% = ${benchmarkLabel}` : "Service"}</span>
      </div>
    </div>
  );
}
