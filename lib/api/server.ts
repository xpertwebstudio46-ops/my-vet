import "server-only";
import type { ApiEnvelope, Paginated, Practice, PracticeReview } from "./types";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope?.success || envelope.data === null) {
    throw new ApiRequestError(envelope?.message ?? "The API request failed", response.status, envelope?.error?.code ?? "API_ERROR");
  }
  return envelope.data;
}

export function getPractices(options: {
  page?: number;
  limit?: number;
  q?: string;
  city?: string;
  sort?: "rating" | "newest" | "name";
} = {}) {
  const query = new URLSearchParams();
  query.set("page", String(options.page ?? 1));
  query.set("limit", String(options.limit ?? 20));
  if (options.q) query.set("q", options.q);
  if (options.city) query.set("city", options.city);
  if (options.sort) query.set("sort", options.sort);
  return apiFetch<Paginated<Practice>>(`/api/practices?${query.toString()}`);
}

export function getPractice(slug: string) {
  return apiFetch<Practice>(`/api/practices/${encodeURIComponent(slug)}`);
}

export function getPracticeReviews(practiceId: string, limit = 10) {
  return apiFetch<Paginated<PracticeReview>>(`/api/reviews/practice/${encodeURIComponent(practiceId)}?page=1&limit=${limit}`);
}
