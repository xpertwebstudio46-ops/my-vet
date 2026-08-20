"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type PracticeDetailsFormData = {
  practiceName: string;
  veterinaryType: string;
  addressLine1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
  website: string;
};

type PracticeDetailsFormProps = {
  price?: string;
  onSubmit?: (formData: PracticeDetailsFormData) => void | Promise<void>;
  submitting?: boolean;
  feedback?: { type: "success" | "error"; message: string } | null;
};

export default function PracticeDetailsForm({
  price = "GBP 29",
  onSubmit,
  submitting = false,
  feedback = null,
}: PracticeDetailsFormProps) {
  const [formData, setFormData] = useState<PracticeDetailsFormData>({
    practiceName: "",
    veterinaryType: "",
    addressLine1: "",
    city: "",
    postcode: "",
    email: "",
    phone: "",
    website: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="w-full max-w-[50%] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-[#064071] font-bold font-heading text-[36px]">
        Practice Details
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">
              Practice Name *
            </label>
            <input
              type="text"
              name="practiceName"
              value={formData.practiceName}
              onChange={handleChange}
              placeholder="e.g. Greenfield Vets"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">
              Veterinary Type *
            </label>
            <input
              type="text"
              name="veterinaryType"
              value={formData.veterinaryType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-sans font-medium text-black mb-1">
            Address line 1 *
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="Street and building"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">City *</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">Postcode *</label>
            <input type="text" name="postcode" value={formData.postcode} onChange={handleChange} required className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@practice.com"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-[14px] font-sans font-medium text-black mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01234 567890"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-sans text-[16px] font-normal text-[#9CA3AF] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-sans font-medium text-black mb-1">
            Website URL
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://www.yourpractice.com"
            className="w-full rounded-lg border font-sans text-[16px] font-normal text-[#9CA3AF] border-slate-200 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={`text-sm ${feedback.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{feedback.message}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : `Register Practice (${price})`}
        </button>

        <p className="text-center text-xs text-slate-400">
          By completing you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}
