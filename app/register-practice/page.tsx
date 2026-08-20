"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlanSelector, {
  type PlanId,
} from "@/components/registerPractice/PlanSelector";
import PracticeDetailsForm, {
  type PracticeDetailsFormData,
} from "@/components/registerPractice/PracticeDetailsForm";
import RegisterHero from "@/components/registerPractice/RegisterHero";
import FaqSection from "@/components/registerPractice/faq";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Practice } from "@/lib/api/types";


const planPrices = {
  free: "£0",
  professional: "£29",
  premium: "£59",
};

export default function RegisterPracticePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("free");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleFormSubmit = async (formData: PracticeDetailsFormData) => {
    if (!user) {
      setFeedback({ type: "error", message: "Create or sign in to a veterinary-practice account before submitting this listing." });
      return;
    }
    if (user.role !== "VET") {
      setFeedback({ type: "error", message: "Only veterinary-practice accounts can register a practice." });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await apiClient<Practice>("/api/practices", {
        method: "POST",
        body: JSON.stringify({
          name: formData.practiceName,
          description: `Veterinary type: ${formData.veterinaryType}`,
          addressLine1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode,
          email: formData.email,
          phone: formData.phone,
          ...(formData.website ? { website: formData.website } : {}),
        }),
      });
      setFeedback({ type: "success", message: "Practice submitted for admin approval. You can finish its profile in the dashboard." });
      window.setTimeout(() => router.push("/vet-dashboard/practice-information"), 900);
    } catch (caught) {
      setFeedback({ type: "error", message: caught instanceof ApiClientError ? caught.message : "The practice could not be submitted." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
     
      <RegisterHero/>
      {!user && <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-teal-200 bg-teal-50 p-4 text-center text-sm text-slate-700"><Link href="/register" className="font-semibold text-[#064071]">Create a veterinary-practice account</Link> or <Link href="/login" className="font-semibold text-[#064071]">sign in</Link> before submitting.</div>}
      <section className="bg-slate-50 my-20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl px-6 flex  gap-8 items-start justify-between">
          <PlanSelector
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
          />
          <PracticeDetailsForm
            price={planPrices[selectedPlan]}
            onSubmit={handleFormSubmit}
            submitting={submitting}
            feedback={feedback}
          />
        </div>
      </section>
      <FaqSection/>
      <Footer/>
    </>
  );
}
