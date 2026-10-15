"use client";

import { useState } from "react";
import { SlidersHorizontal, Star } from "lucide-react";
import type { PracticeMembershipType } from "@/lib/api/types";

const facilities = [
  "On-site Parking",
  "Wheelchair Access",
  "In-house Lab",
  "Isolation Ward",
];

const openingHours = ["Open Now", "Open Weekends"];

const ratingOptions = [4, 3, 2];

const practiceTypes: Array<{ label: string; value: PracticeMembershipType }> = [
  { label: "Independent Practice", value: "INDEPENDENT" },
  { label: "Vet Group", value: "GROUP" },
];

export interface FiltersState {
  minRating: number | null;
  membershipTypes: PracticeMembershipType[];
  facilities: string[];
  openingHours: string[];
  animalTypes: string[];
}

export type AnimalTypeOption = { name: string; slug: string };
const VISIBLE_ANIMAL_TYPES = 6;

export default function FiltersSidebar({
  onChange,
  animalTypes,
}: {
  onChange?: (filters: FiltersState) => void;
  animalTypes: AnimalTypeOption[];
}) {
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedMembershipTypes, setSelectedMembershipTypes] = useState<PracticeMembershipType[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedAnimalTypes, setSelectedAnimalTypes] = useState<string[]>([]);
  const [showAllAnimals, setShowAllAnimals] = useState(false);

  const emit = (next: Partial<FiltersState>) => {
    onChange?.({
      minRating,
      membershipTypes: selectedMembershipTypes,
      facilities: selectedFacilities,
      openingHours: selectedHours,
      animalTypes: selectedAnimalTypes,
      ...next,
    });
  };

  const toggleMembershipType = (membershipType: PracticeMembershipType) => {
    const next = selectedMembershipTypes.includes(membershipType)
      ? selectedMembershipTypes.filter((item) => item !== membershipType)
      : [...selectedMembershipTypes, membershipType];
    setSelectedMembershipTypes(next);
    emit({ membershipTypes: next });
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
    setSelectedMembershipTypes([]);
    setSelectedFacilities([]);
    setSelectedHours([]);
    setSelectedAnimalTypes([]);
    onChange?.({ minRating: null, membershipTypes: [], facilities: [], openingHours: [], animalTypes: [] });
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

      {/* Practice Type */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-900 mb-2.5">
          Practice Type
        </p>
        <div className="flex flex-col gap-2">
          {practiceTypes.map((practiceType) => (
            <label
              key={practiceType.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedMembershipTypes.includes(practiceType.value)}
                onChange={() => toggleMembershipType(practiceType.value)}
                className="h-4 w-4 rounded border-slate-300 accent-[#13b8a8]"
              />
              <span className="text-xs text-slate-600">{practiceType.label}</span>
            </label>
          ))}
        </div>
      </div>

      <fieldset className="mt-5 min-w-0">
        <legend className="mb-2.5 text-xs font-semibold text-slate-900">Animal Type</legend>
        <div className="flex flex-col gap-2" id="directory-animal-types">
          {(showAllAnimals ? animalTypes : animalTypes.slice(0, VISIBLE_ANIMAL_TYPES)).map((animal) => (
            <label key={animal.slug} className="flex min-w-0 cursor-pointer items-start gap-2">
              <input type="checkbox" checked={selectedAnimalTypes.includes(animal.slug)} onChange={() => {
                const next = selectedAnimalTypes.includes(animal.slug) ? selectedAnimalTypes.filter((value) => value !== animal.slug) : [...selectedAnimalTypes, animal.slug];
                setSelectedAnimalTypes(next);
                emit({ animalTypes: next });
              }} className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#13b8a8]" />
              <span className="min-w-0 break-words text-xs text-slate-600">{animal.name}</span>
            </label>
          ))}
          {!animalTypes.length && <p className="text-xs text-slate-500">No animal types published yet.</p>}
        </div>
        {animalTypes.length > VISIBLE_ANIMAL_TYPES && <button type="button" aria-expanded={showAllAnimals} aria-controls="directory-animal-types" onClick={() => setShowAllAnimals((value) => !value)} className="mt-3 text-xs font-semibold text-[#085A9E] hover:underline focus-visible:outline-2 focus-visible:outline-[#13b8a8]">{showAllAnimals ? 'Read less' : 'Read more'}</button>}
      </fieldset>

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
