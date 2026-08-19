"use client";

import { useState } from "react";
import PlanSelector, {
  type PlanId,
} from "@/components/registerPractice/PlanSelector";
import PracticeDetailsForm, {
  type PracticeDetailsFormData,
} from "@/components/registerPractice/PracticeDetailsForm";
import RegisterHero from "@/components/registerPractice/RegisterHero";
import FaqSection from "@/components/registerPractice/faq";
import Footer from "@/components/Footer";


const planPrices = {
  free: "£0",
  professional: "£29",
  premium: "£59",
};

export default function RegisterPracticePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("professional");

  const handleFormSubmit = async (formData: PracticeDetailsFormData) => {
    const res = await fetch("/api/register-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan, ...formData }),
    });

    if (!res.ok) {
      // handle error (toast/inline message)
      return;
    }
    // redirect ya success state
  };

  return (
    <>
     
      <RegisterHero/>
      <section className="bg-slate-50 my-20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl px-6 flex  gap-8 items-start justify-between">
          <PlanSelector
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
          />
          <PracticeDetailsForm
            price={planPrices[selectedPlan]}
            onSubmit={handleFormSubmit}
          />
        </div>
      </section>
      <FaqSection/>
      <Footer/>
    </>
  );
}
