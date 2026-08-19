"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export type PlanId = "free" | "professional" | "premium";

type Plan = {
  id: PlanId;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  recommended: boolean;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Plan",
    description: "Basic listing to get started.",
    price: "£0",
    period: "",
    features: ["Basic practice info", "Location visibility"],
    recommended: false,
  },
  {
    id: "professional",
    name: "Professional Plan",
    description: "Everything needed to attract clients.",
    price: "£29",
    period: "/mo",
    features: [
      "Full profile page",
      "Customer reviews management",
      "Analytics dashboard",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Plan",
    description: "Maximize your visibility.",
    price: "£59",
    period: "/mo",
    features: [
      "Featured placement",
      "Unlimited media uploads",
      "Priority support",
    ],
    recommended: false,
  },
];

type PlanSelectorProps = {
  selectedPlan?: PlanId;
  onSelectPlan?: (planId: PlanId) => void;
};

export default function PlanSelector({
  selectedPlan,
  onSelectPlan,
}: PlanSelectorProps) {
  const [internalSelected, setInternalSelected] =
    useState<PlanId>("professional");

  const selected = selectedPlan ?? internalSelected;
  const handleSelect = (id: PlanId) => {
    setInternalSelected(id);
    onSelectPlan?.(id);
  };

  return (
    <div className="w-full max-w-[50%] ">
      <h2 className="text-[#064071] font-bold font-heading  text-[36px]">Choose Your Plan</h2>
      <p className="mt-1 text-[16px] font-sans font-normal text-black">
        Select the plan that best fits your practice&apos;s growth goals.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelect(plan.id)}
              className={`relative w-full text-left rounded-2xl border bg-white p-5 transition-colors ${
                isSelected
                  ? "border-teal-500 ring-1 ring-teal-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-4 rounded-full bg-teal-500 px-3 py-1 text-[11px] font-semibold text-white">
                  Recommended
                </span>
              )}

              <div className="flex items-start justify-between">
                <h3 className="font-bold text-[22px] text-[#064071] font-heading">{plan.name}</h3>
                <div className="whitespace-nowrap text-[20px] font-bold font-sans text-[#0A2A43]">
                  {plan.price}
                  {plan.period && (
                    <span className="ml-0.5 text-[14px] font-normal font-sans text-[#64748B]">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-[14px] font-sans font-normal text-[#64748B]">{plan.description}</p>

              <ul className="mt-3 flex flex-col gap-1.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-[14px] font-sans font-normal text-[#64748B]"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-teal-500"
                      strokeWidth={2}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}
