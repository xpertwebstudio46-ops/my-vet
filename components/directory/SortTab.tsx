"use client";

import { useState } from "react";

const tabs = ["Featured", "Highest Rated", "Newest"] as const;
export type SortTab = (typeof tabs)[number];

export default function SortTabs({
  onChange,
}: {
  onChange?: (tab: SortTab) => void;
}) {
  const [active, setActive] = useState<SortTab>("Featured");

  const handleClick = (tab: SortTab) => {
    setActive(tab);
    onChange?.(tab);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleClick(tab)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === tab
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}