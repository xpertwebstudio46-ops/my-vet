"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";

type Pricing = {
  id: string;
  kind: "SERVICE" | "HEALTH_PACKAGE";
  section: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  billingPeriod: "ONE_OFF" | "MONTHLY" | "YEARLY" | null;
  active: boolean;
  sortOrder: number;
};
const empty = {
  kind: "SERVICE" as Pricing["kind"],
  section: "",
  name: "",
  description: "",
  price: "",
  billingPeriod: "ONE_OFF" as NonNullable<Pricing["billingPeriod"]>,
};

export function VetPricingPage() {
  const [items, setItems] = useState<Pricing[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void apiClient<Pricing[]>("/api/vet/pricing")
      .then(setItems)
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Pricing could not be loaded.",
        ),
      );
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const item = await apiClient<Pricing>(
        editing ? `/api/vet/pricing/${editing.id}` : "/api/vet/pricing",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            currency: "GBP",
            description: form.description || null,
            billingPeriod:
              form.kind === "HEALTH_PACKAGE" ? form.billingPeriod : "ONE_OFF",
            active: editing?.active ?? true,
            sortOrder: editing?.sortOrder ?? items.length,
          }),
        },
      );
      setItems((current) =>
        editing
          ? current.map((value) => (value.id === item.id ? item : value))
          : [...current, item],
      );
      setEditing(null);
      setForm(empty);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Pricing could not be saved.",
      );
    }
  }
  async function remove(item: Pricing) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await apiClient(`/api/vet/pricing/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((value) => value.id !== item.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pricing could not be deleted.");
    }
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <h1 className="dashboard-heading text-5xl">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Service fees and recurring health packages.
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
      <form
        onSubmit={(event) => void save(event)}
        className="grid gap-3 rounded-xl bg-white p-5 md:grid-cols-3"
      >
        <select
          value={form.kind}
          onChange={(e) =>
            setForm({ ...form, kind: e.target.value as Pricing["kind"] })
          }
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="SERVICE">Service</option>
          <option value="HEALTH_PACKAGE">Health package</option>
        </select>
        <input
          required
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
          placeholder="Section"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Item name"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price GBP"
          className="h-10 rounded-md border px-3 text-sm"
        />
        {form.kind === "HEALTH_PACKAGE" ? (
          <select
            value={form.billingPeriod}
            onChange={(e) =>
              setForm({
                ...form,
                billingPeriod: e.target.value as typeof form.billingPeriod,
              })
            }
            className="h-10 rounded-md border px-3 text-sm"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="ONE_OFF">One off</option>
          </select>
        ) : (
          <div className="flex justify-end">
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
              <Plus className="size-4" />
              {editing ? "Update" : "Add price"}
            </button>
          </div>
        )}
        {form.kind === "HEALTH_PACKAGE" && (
          <div className="md:col-start-3 flex justify-end">
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
              <Plus className="size-4" />
              {editing ? "Update" : "Add price"}
            </button>
          </div>
        )}
      </form>
      <div className="grid gap-5 xl:grid-cols-2">
        {(["SERVICE", "HEALTH_PACKAGE"] as const).map((kind) => (
          <Card key={kind} className="overflow-hidden p-0">
            <h2 className="border-b p-5 font-semibold">
              {kind === "SERVICE" ? "Service pricing" : "Health packages"}
            </h2>
            {items
              .filter((item) => item.kind === kind)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.section} &middot; {item.description}
                    </p>
                  </div>
                  <strong>
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: item.currency }).format(Number(item.price))}
                    {item.billingPeriod === "MONTHLY"
                      ? "/mo"
                      : item.billingPeriod === "YEARLY"
                        ? "/yr"
                        : ""}
                  </strong>
                  <button
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        kind: item.kind,
                        section: item.section,
                        name: item.name,
                        description: item.description ?? "",
                        price: item.price,
                        billingPeriod: item.billingPeriod ?? "ONE_OFF",
                      });
                    }}
                    className="rounded-md border px-3 py-2 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void remove(item)}
                    className="text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            {!items.some((item) => item.kind === kind) && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No items yet.
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
