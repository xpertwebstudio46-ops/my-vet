import { Star } from "lucide-react";

export interface Review {
  id: string;
  name: string;
  timeAgo: string;
  rating: number;
  comment: string;
  avatarInitial: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i < rating ? "#f5a623" : "none"}
          stroke={i < rating ? "#f5a623" : "#cbd5e1"}
        />
      ))}
    </div>
  );
}

export default function PetOwnerReviews({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0d2e5e]">
          Pet Owner Reviews
        </h2>
        <p className="text-xs text-slate-500">
          {averageRating} out of 5 ({totalReviews} reviews)
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "#0d2e5e" }}
              >
                {review.avatarInitial}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {review.name}
                </p>
                <p className="text-xs text-slate-400">{review.timeAgo}</p>
              </div>
            </div>

            <div className="mt-2">
              <StarRating rating={review.rating} />
            </div>

            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
        {!reviews.length && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            This listing has a historical aggregate rating, but no individual approved reviews have been published on MY VET yet.
          </div>
        )}
      </div>
    </div>
  );
}
