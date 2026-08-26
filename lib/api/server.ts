import "server-only";
import type { ApiEnvelope, BlogPost, BlogPostSummary, Paginated, Practice, PracticeReview, Sponsorship, SubscriptionPlan } from "./types";

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
  animalType?: string;
  service?: string;
  sort?: "rating" | "newest" | "name";
} = {}) {
  const query = new URLSearchParams();
  query.set("page", String(options.page ?? 1));
  query.set("limit", String(options.limit ?? 20));
  if (options.q) query.set("q", options.q);
  if (options.city) query.set("city", options.city);
  if (options.animalType) query.set("animalType", options.animalType);
  if (options.service) query.set("service", options.service);
  if (options.sort) query.set("sort", options.sort);
  return apiFetch<Paginated<Practice>>(`/api/practices?${query.toString()}`);
}

export function getPractice(slug: string) {
  return apiFetch<Practice>(`/api/practices/${encodeURIComponent(slug)}`);
}

export function getPracticeReviews(practiceId: string, limit = 10) {
  return apiFetch<Paginated<PracticeReview>>(`/api/reviews/practice/${encodeURIComponent(practiceId)}?page=1&limit=${limit}`);
}

export function getBlogPosts(page = 1, limit = 24) {
  return apiFetch<Paginated<BlogPostSummary>>(`/api/blog?page=${page}&limit=${limit}`);
}

export function getBlogPost(slug: string) {
  return apiFetch<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`);
}

export function getSponsorships() {
  return apiFetch<Sponsorship[]>("/api/sponsorships");
}

export function getSubscriptionPlans() {
  return apiFetch<SubscriptionPlan[]>("/api/subscriptions/plans");
}
