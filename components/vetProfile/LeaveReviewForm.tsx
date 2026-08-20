"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";

type Appointment = { id: string; status: string; practice: { id: string; name: string } };

export default function LeaveReviewForm({ practiceId }: { practiceId: string }) {
  const { user, loading } = useAuth();
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [checkedAppointments, setCheckedAppointments] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || user.role !== "PET_OWNER") return;
    void apiClient<Paginated<Appointment>>("/api/appointments?view=all&status=COMPLETED&page=1&limit=100")
      .then((result) => setAppointmentId(result.items.find((item) => item.practice.id === practiceId)?.id ?? null))
      .catch(() => setAppointmentId(null))
      .finally(() => setCheckedAppointments(true));
  }, [practiceId, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointmentId || rating === 0) return;
    const form = new FormData(event.currentTarget);
    setError("");
    setSuccess("");
    try {
      await apiClient("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          practiceId,
          appointmentId,
          rating,
          title: String(form.get("title") || "") || null,
          comment: String(form.get("comment")),
        }),
      });
      setSuccess("Your review was submitted and is awaiting moderation.");
      event.currentTarget.reset();
      setRating(0);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "The review could not be submitted.");
    }
  }

  if (loading) return null;
  if (!user) return <div className="rounded-2xl bg-[#eef1f5] p-6 text-sm text-slate-600"><Link href="/login" className="font-semibold text-[#064071]">Sign in</Link> with a pet-owner account to leave a verified review.</div>;
  if (user.role !== "PET_OWNER") return null;
  if (checkedAppointments && !appointmentId) return <div className="rounded-2xl bg-[#eef1f5] p-6 text-sm text-slate-600">Reviews are verified. You can review this practice after it marks one of your appointments as completed.</div>;

  return (
    <div className="rounded-2xl bg-[#eef1f5] p-6 sm:p-8">
      <h3 className="text-lg font-bold text-[#0d2e5e]">Leave a verified review</h3>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Your Rating</label><div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          const filled = value <= (hoverRating || rating);
          return <button key={value} type="button" onClick={() => setRating(value)} onMouseEnter={() => setHoverRating(value)} onMouseLeave={() => setHoverRating(0)} aria-label={`Rate ${value} stars`}><Star className="h-5 w-5" fill={filled ? "#f5a623" : "none"} stroke={filled ? "#f5a623" : "#cbd5e1"} /></button>;
        })}</div></div>
        <input name="title" maxLength={120} placeholder="Review title (optional)" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        <textarea name="comment" required minLength={10} maxLength={5000} rows={4} placeholder="Share your experience..." className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}
        <button type="submit" disabled={!appointmentId || rating === 0} className="self-start rounded-lg bg-[#0d2e5e] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Submit Review</button>
      </form>
    </div>
  );
}
