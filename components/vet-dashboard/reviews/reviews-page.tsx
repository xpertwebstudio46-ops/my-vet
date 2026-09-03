"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, MessageSquareReply, Star } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
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
  const [message, setMessage] = useState("");
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [replying, setReplying] = useState<Review | null>(null);
  const [reporting, setReporting] = useState<Review | null>(null);
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
  async function reply(item: Review, text: string) {
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
      setReplying(null);
      setMessage("Reply saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Reply could not be posted.",
      );
    }
  }
  async function report(item: Review, reason: string) {
    setReportingId(item.id);
    setError("");
    setMessage("");
    try {
      await apiClient(`/api/reviews/${item.id}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setItems((current) => current.filter((value) => value.id !== item.id));
      setReporting(null);
      setMessage("Review reported and sent to admin for review.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Review could not be reported.",
      );
    } finally {
      setReportingId(null);
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
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
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
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setReplying(item)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold"
                >
                  <MessageSquareReply className="size-4" />
                  {item.reply ? "Edit reply" : "Reply"}
                </button>
                <button
                  disabled={reportingId === item.id}
                  onClick={() => setReporting(item)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-600 disabled:opacity-50"
                >
                  <Flag className="size-4" />
                  {reportingId === item.id ? "Reporting..." : "Report review"}
                </button>
              </div>
            </div>
          </Card>
        ))}
        {!items.length && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No approved reviews yet.
          </Card>
        )}
      </div>
      {replying && <ReplyModal review={replying} onClose={() => setReplying(null)} onConfirm={reply} />}
      {reporting && <ReportReviewModal review={reporting} saving={reportingId === reporting.id} onClose={() => setReporting(null)} onConfirm={report} />}
    </div>
  );
}

function ReplyModal({ review, onClose, onConfirm }: { review: Review; onClose: () => void; onConfirm: (review: Review, reply: string) => Promise<void> }) {
  const [reply, setReply] = useState(review.reply ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <Modal open onClose={onClose} title={review.reply ? "Edit reply" : "Reply to review"} description={`${review.user.firstName} ${review.user.lastName}`}>
      <form onSubmit={(event) => { event.preventDefault(); if (reply.trim().length < 2) return; setSaving(true); void onConfirm(review, reply.trim()).finally(() => setSaving(false)); }}>
        <label className="block text-sm font-medium">
          Your reply
          <textarea autoFocus required minLength={2} maxLength={3000} rows={5} value={reply} onChange={(event) => setReply(event.target.value)} className="mt-2 w-full rounded-lg border p-3 text-sm" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button>
          <button disabled={saving || reply.trim().length < 2} className="h-10 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save reply"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ReportReviewModal({ review, saving, onClose, onConfirm }: { review: Review; saving: boolean; onClose: () => void; onConfirm: (review: Review, reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("");

  return (
    <Modal open onClose={onClose} title="Report review" description="Send this review to admin for moderation. It will be hidden while admin reviews your report.">
      <form onSubmit={(event) => { event.preventDefault(); if (reason.trim().length < 3) return; void onConfirm(review, reason.trim()); }}>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">{review.comment}</div>
        <label className="mt-4 block text-sm font-medium">
          Reason
          <textarea autoFocus required minLength={3} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-lg border p-3 text-sm" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button>
          <button disabled={saving || reason.trim().length < 3} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Reporting..." : "Send report"}</button>
        </div>
      </form>
    </Modal>
  );
}
