"use client";

import { useEffect, useState } from "react";
import { Eye, MousePointerClick, Send } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";

type Plan = {
  id: string;
  name: string;
  tier: string;
  durationDays: number;
  price: string;
  currency: string;
};
type Listing = {
  id: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  plan: Plan;
};
type Stats = {
  listing: unknown;
  impressions: number;
  clicks: number;
  enquiries: number;
  clickThroughRate: number;
};

export function VetFeaturedListingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void Promise.all([
      apiClient<Plan[]>("/api/vet/featured-listing/plans"),
      apiClient<Listing | null>("/api/vet/featured-listing"),
      apiClient<Stats>("/api/vet/featured-listing/stats"),
    ])
      .then(([planItems, current, performance]) => {
        setPlans(planItems);
        setListing(current);
        setStats(performance);
      })
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Featured listing could not be loaded.",
        ),
      );
  }, []);
  async function purchase(plan: Plan) {
    try {
      const result = await apiClient<{ checkoutUrl: string | null }>(
        "/api/vet/featured-listing/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            planId: plan.id,
            successUrl: `${window.location.origin}/vet-dashboard/featured-listing?checkout=success`,
            cancelUrl: `${window.location.origin}/vet-dashboard/featured-listing?checkout=cancelled`,
          }),
        },
      );
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Checkout could not be started.",
      );
    }
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <h1 className="dashboard-heading text-5xl">Featured listing</h1>
        <p className="text-sm text-muted-foreground">
          Purchase and measure priority directory placement.
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
      {listing && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Current listing: {listing.plan.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {listing.status}
                {listing.endsAt
                  ? ` - Ends ${new Date(listing.endsAt).toLocaleDateString("en-GB")}`
                  : ""}
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-[#01AEAD]">
              {listing.status}
            </span>
          </div>
        </Card>
      )}
      {stats && (
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric
            label="Impressions"
            value={stats.impressions}
            icon={<Eye />}
          />
          <Metric
            label="Clicks"
            value={stats.clicks}
            icon={<MousePointerClick />}
          />
          <Metric label="Enquiries" value={stats.enquiries} icon={<Send />} />
        </section>
      )}
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col p-5">
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="mt-3 text-3xl font-semibold text-[#064071]">
              {plan.currency} {plan.price}
            </p>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {plan.durationDays} days &middot; {plan.tier} placement
            </p>
            <button
              disabled={Boolean(
                listing && ["PENDING", "ACTIVE"].includes(listing.status),
              )}
              onClick={() => void purchase(plan)}
              className="mt-5 h-10 rounded-md bg-[#01AEAD] text-sm font-semibold text-white disabled:opacity-50"
            >
              Purchase listing
            </button>
          </Card>
        ))}
      </section>
    </div>
  );
}
function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </div>
      <span className="text-[#01AEAD] [&>svg]:size-5">{icon}</span>
    </Card>
  );
}
