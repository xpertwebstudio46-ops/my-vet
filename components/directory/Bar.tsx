"use client";

import { useState } from "react";
import { SlidersHorizontal, Star } from "lucide-react";

const facilities = [
  "On-site Parking",
  "Wheelchair Access",
  "In-house Lab",
  "Isolation Ward",
];

const openingHours = ["Open Now", "Open Weekends"];

const ratingOptions = [4, 3, 2];

export interface FiltersState {
  minRating: number | null;
  facilities: string[];
  openingHours: string[];
}

export default function FiltersSidebar({
  onChange,
}: {
  onChange?: (filters: FiltersState) => void;
}) {
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  const emit = (next: Partial<FiltersState>) => {
    onChange?.({
      minRating,
      facilities: selectedFacilities,
      openingHours: selectedHours,
      ...next,
    });
  };

  const toggleFacility = (facility: string) => {
    const next = selectedFacilities.includes(facility)
      ? selectedFacilities.filter((f) => f !== facility)
      : [...selectedFacilities, facility];
    setSelectedFacilities(next);
    emit({ facilities: next });
  };

  const toggleHour = (hour: string) => {
    const next = selectedHours.includes(hour)
      ? selectedHours.filter((h) => h !== hour)
      : [...selectedHours, hour];
    setSelectedHours(next);
    emit({ openingHours: next });
  };

  const selectRating = (rating: number) => {
    const next = minRating === rating ? null : rating;
    setMinRating(next);
    emit({ minRating: next });
  };

  const clearAll = () => {
    setMinRating(null);
    setSelectedFacilities([]);
    setSelectedHours([]);
    onChange?.({ minRating: null, facilities: [], openingHours: [] });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Filters</h3>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium"
          style={{ color: "#13b8a8" }}
        >
          Clear All
        </button>
      </div>

      {/* Minimum Rating */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-900 mb-2.5">
          Minimum Rating
        </p>
        <div className="flex flex-col gap-2">
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => selectRating(rating)}
              className="flex items-center gap-2"
            >
              <span
                className="h-4 w-4 rounded-full border flex items-center justify-center shrink-0"
                style={{
                  borderColor: minRating === rating ? "#13b8a8" : "#cbd5e1",
                  backgroundColor:
                    minRating === rating ? "#13b8a8" : "transparent",
                }}
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    fill={i < rating ? "#f5a623" : "none"}
                    stroke={i < rating ? "#f5a623" : "#cbd5e1"}
                  />
                ))}
              </span>
              <span className="text-xs text-slate-500">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-900 mb-2.5">
          Facilities
        </p>
        <div className="flex flex-col gap-2">
          {facilities.map((facility) => (
            <label
              key={facility}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility)}
                onChange={() => toggleFacility(facility)}
                className="h-4 w-4 rounded border-slate-300 accent-[#13b8a8]"
              />
              <span className="text-xs text-slate-600">{facility}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Opening Hours */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-900 mb-2.5">
          Opening Hours
        </p>
        <div className="flex flex-col gap-2">
          {openingHours.map((hour) => (
            <label key={hour} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedHours.includes(hour)}
                onChange={() => toggleHour(hour)}
                className="h-4 w-4 rounded border-slate-300 accent-[#13b8a8]"
              />
              <span className="text-xs text-slate-600">{hour}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}