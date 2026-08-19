"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function LeaveReviewForm({
  onSubmit,
}: {
  onSubmit?: (data: {
    rating: number;
    name: string;
    email: string;
    comment: string;
  }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ rating, name, email, comment });
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ backgroundColor: "#eef1f5" }}
    >
      <h3 className="text-lg font-bold text-[#0d2e5e]">Leave a Review</h3>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const filled = value <= (hoverRating || rating);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  <Star
                    className="h-5 w-5"
                    fill={filled ? "#f5a623" : "none"}
                    stroke={filled ? "#f5a623" : "#cbd5e1"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (not published)"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />

        <button
          type="submit"
          className="self-start rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0d2e5e" }}
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}