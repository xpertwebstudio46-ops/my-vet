"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { AdminPageBanner } from "../shared/admin-page-banner";

type Plan = {
  id: string;
  name: string;
  tier: string;
  durationDays: number;
  price: string;
  currency: string;
  stripePriceId: string | null;
  active: boolean;
};
type Listing = {
  id: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  startsAt: string | null;
  endsAt: string | null;
  practice: { id: string; name: string };
  plan: Plan;
};

export function FeaturedListingsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    tier: "",
    durationDays: "30",
    price: "0",
    currency: "GBP",
    stripePriceId: "",
    active: true,
  });
  useEffect(() => {
    void Promise.all([
      apiClient<Plan[]>("/api/admin/featured-listing-plans"),
      apiClient<Listing[]>("/api/admin/featured-listings"),
    ])
      .then(([planItems, listingItems]) => {
        setPlans(planItems);
        setListings(listingItems);
      })
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Featured listings could not be loaded.",
        ),
      );
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const plan = await apiClient<Plan>(
        editing
          ? `/api/admin/featured-listing-plans/${editing.id}`
          : "/api/admin/featured-listing-plans",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            name: form.name,
            tier: form.tier,
            durationDays: Number(form.durationDays),
            price: Number(form.price),
            currency: form.currency,
            stripePriceId: form.stripePriceId || null,
            active: form.active,
          }),
        },
      );
      setPlans((current) =>
        editing
          ? current.map((item) => (item.id === plan.id ? plan : item))
          : [...current, plan],
      );
      setEditing(null);
      setForm({
        name: "",
        tier: "",
        durationDays: "30",
        price: "0",
        currency: "GBP",
        stripePriceId: "",
        active: true,
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Plan could not be saved.",
      );
    }
  }
  async function status(
    item: Listing,
    next: "ACTIVE" | "CANCELLED" | "EXPIRED",
  ) {
    try {
      const updated = await apiClient<Listing>(
        `/api/admin/featured-listings/${item.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: next }) },
      );
      setListings((current) =>
        current.map((value) =>
          value.id === item.id ? { ...value, ...updated } : value,
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Listing could not be updated.",
      );
    }
  }
  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Featured Listings"
        description="Manage boost products and real listing purchases."
      />
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <form
        onSubmit={(event) => void save(event)}
        className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-3"
      >
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Plan name"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          required
          value={form.tier}
          onChange={(e) => setForm({ ...form, tier: e.target.value })}
          placeholder="Tier"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          required
          type="number"
          min="1"
          value={form.durationDays}
          onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
          placeholder="Duration days"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          value={form.stripePriceId}
          onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })}
          placeholder="Stripe price ID"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <button className="rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
          {editing ? "Update plan" : "Create plan"}
        </button>
      </form>
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-5">
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="mt-2 text-2xl font-semibold">
              {plan.currency} {plan.price}
            </p>
            <p className="text-sm text-muted-foreground">
              {plan.durationDays} days &middot; {plan.tier}
            </p>
            <button
              onClick={() => {
                setEditing(plan);
                setForm({
                  name: plan.name,
                  tier: plan.tier,
                  durationDays: String(plan.durationDays),
                  price: plan.price,
                  currency: plan.currency,
                  stripePriceId: plan.stripePriceId ?? "",
                  active: plan.active,
                });
              }}
              className="mt-4 rounded-md border px-3 py-2 text-sm"
            >
              Edit
            </button>
          </Card>
        ))}
      </section>
      <Card className="overflow-hidden p-0">
        <div className="border-b p-5">
          <h2 className="font-semibold">Purchases and requests</h2>
        </div>
        {listings.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{item.practice.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.plan.name} &middot; Requested{" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {item.status}
            </span>
            <div className="flex gap-2">
              {item.status === "PENDING" && (
                <button
                  onClick={() => void status(item, "ACTIVE")}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Activate
                </button>
              )}
              {!["CANCELLED", "EXPIRED"].includes(item.status) && (
                <button
                  onClick={() => void status(item, "CANCELLED")}
                  className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {!listings.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No featured listing purchases yet.
          </p>
        )}
      </Card>
    </div>
  );
}
