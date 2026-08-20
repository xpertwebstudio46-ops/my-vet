"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareReply, Star } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  helpfulCount: number;
  user: { firstName: string; lastName: string; avatar: string | null };
};

export function VetReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void apiClient<Review[]>("/api/vet/reviews")
      .then(setItems)
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Reviews could not be loaded.",
        ),
      );
  }, []);
  const average = useMemo(
    () =>
      items.length
        ? items.reduce((total, item) => total + item.rating, 0) / items.length
        : 0,
    [items],
  );
  async function reply(item: Review) {
    const text = window.prompt("Reply to this review:", item.reply ?? "");
    if (!text) return;
    try {
      const updated = await apiClient<Review>(`/api/reviews/${item.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply: text }),
      });
      setItems((current) =>
        current.map((value) =>
          value.id === item.id
            ? { ...value, reply: updated.reply, repliedAt: updated.repliedAt }
            : value,
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Reply could not be posted.",
      );
    }
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <h1 className="dashboard-heading text-5xl">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Approved owner reviews and practice replies.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Average rating</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-semibold">
            <Star className="size-6 fill-amber-400 text-amber-400" />
            {average.toFixed(1)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Published reviews</p>
          <p className="mt-2 text-3xl font-semibold">{items.length}</p>
        </Card>
      </section>
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">
                    {item.user.firstName} {item.user.lastName}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <Star className="size-4 fill-current" />
                    {item.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.comment}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("en-GB")} &middot;{" "}
                  {item.helpfulCount} helpful
                </p>
                {item.reply && (
                  <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm">
                    <strong>Your reply:</strong> {item.reply}
                  </div>
                )}
              </div>
              <button
                onClick={() => void reply(item)}
                className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold"
              >
                <MessageSquareReply className="size-4" />
                {item.reply ? "Edit reply" : "Reply"}
              </button>
            </div>
          </Card>
        ))}
        {!items.length && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No approved reviews yet.
          </Card>
        )}
      </div>
    </div>
  );
}
