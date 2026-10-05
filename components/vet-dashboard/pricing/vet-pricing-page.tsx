"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
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
  vatMode: "INC_VAT" | "EX_VAT";
  billingPeriod: "ONE_OFF" | "MONTHLY" | "YEARLY" | null;
  active: boolean;
  sortOrder: number;
};

type PricingForm = {
  kind: Pricing["kind"];
  section: string;
  name: string;
  description: string;
  price: string;
  vatMode: Pricing["vatMode"];
  billingPeriod: NonNullable<Pricing["billingPeriod"]>;
};

const empty: PricingForm = {
  kind: "SERVICE",
  section: "",
  name: "",
  description: "",
  price: "",
  vatMode: "INC_VAT",
  billingPeriod: "ONE_OFF",
};

function formatPrice(item: Pricing) {
  const price = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: item.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(item.price));
  const suffix = item.billingPeriod === "MONTHLY" ? "/mo" : item.billingPeriod === "YEARLY" ? "/yr" : "";
  return `${price}${suffix}`;
}

function vatLabel(mode: Pricing["vatMode"]) {
  return mode === "EX_VAT" ? "ex VAT" : "inc VAT";
}

export function VetPricingPage() {
  const [items, setItems] = useState<Pricing[]>([]);
  const [form, setForm] = useState<PricingForm>(empty);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [deleting, setDeleting] = useState<Pricing | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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

  function openCreate(kind: Pricing["kind"] = "SERVICE") {
    setEditing(null);
    setForm({ ...empty, kind, billingPeriod: kind === "HEALTH_PACKAGE" ? "MONTHLY" : "ONE_OFF" });
    setFormOpen(true);
  }

  function openEdit(item: Pricing) {
    setEditing(item);
    setForm({
      kind: item.kind,
      section: item.section,
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      vatMode: item.vatMode ?? "INC_VAT",
      billingPeriod: item.billingPeriod ?? "ONE_OFF",
    });
    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setForm(empty);
    setFormOpen(false);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const item = await apiClient<Pricing>(
        editing ? `/api/vet/pricing/${editing.id}` : "/api/vet/pricing",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            currency: "GBP",
            vatMode: form.vatMode,
            description: form.description.trim() || null,
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
      closeForm();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Pricing could not be saved.",
      );
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await apiClient(`/api/vet/pricing/${deleting.id}`, { method: "DELETE" });
      setItems((current) => current.filter((value) => value.id !== deleting.id));
      setDeleting(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pricing could not be deleted.");
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-heading text-5xl">Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Service fees and recurring health packages.
          </p>
        </div>
        <button type="button" onClick={() => openCreate()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
          <Plus className="size-4" />
          Add price
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {(["SERVICE", "HEALTH_PACKAGE"] as const).map((kind) => {
          const groupItems = items.filter((item) => item.kind === kind);
          return (
            <Card key={kind} className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-3 border-b p-5">
                <h2 className="font-semibold">
                  {kind === "SERVICE" ? "Service pricing" : "Health packages"}
                </h2>
                <button type="button" onClick={() => openCreate(kind)} className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold text-[#064071]">
                  <Plus className="size-4 text-[#01AEAD]" />
                  Add
                </button>
              </div>
              {groupItems.map((item) => {
                const isExpanded = expanded.has(item.id);
                const hasLongDescription = (item.description?.length ?? 0) > 120;
                return (
                  <div key={item.id} className="flex flex-col gap-4 border-b p-4 last:border-b-0 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase text-[#01AEAD]">{item.section}</p>
                      <h3 className="mt-1 break-words font-semibold text-black">{item.name}</h3>
                      {item.description ? (
                        <div className="mt-2">
                          <p className={`${isExpanded ? "" : "line-clamp-2"} text-sm leading-6 text-muted-foreground`}>
                            {item.description}
                          </p>
                          {hasLongDescription && (
                            <button type="button" onClick={() => toggleExpanded(item.id)} className="mt-1 text-xs font-semibold text-[#064071] hover:underline">
                              {isExpanded ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">No description added.</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 md:min-w-40 md:justify-end">
                      <div className="text-left md:text-right">
                        <strong className="block text-lg text-[#064071]">{formatPrice(item)}</strong>
                        <span className="text-xs font-semibold uppercase text-slate-500">{vatLabel(item.vatMode ?? "INC_VAT")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`} className="inline-flex size-9 items-center justify-center rounded-md border text-slate-500 hover:bg-slate-50 hover:text-[#064071]">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`} className="inline-flex size-9 items-center justify-center rounded-md border text-red-600 hover:bg-red-50">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!groupItems.length && (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No items yet.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={formOpen} onClose={closeForm} title={editing ? `Edit ${editing.name}` : "Add price"} description="Add the item name, description and GBP price shown on your public listing." className="max-w-2xl">
        <form onSubmit={(event) => void save(event)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Pricing type
              <select
                value={form.kind}
                onChange={(event) => {
                  const kind = event.target.value as Pricing["kind"];
                  setForm({ ...form, kind, billingPeriod: kind === "HEALTH_PACKAGE" ? "MONTHLY" : "ONE_OFF" });
                }}
                className="mt-2 h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="SERVICE">Service</option>
                <option value="HEALTH_PACKAGE">Health package</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Section
              <input required value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} placeholder="Consultations" className="mt-2 h-10 w-full rounded-md border px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">
              Title
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Initial consultation" className="mt-2 h-10 w-full rounded-md border px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">
              Price GBP
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="45.00" className="mt-2 h-10 w-full rounded-md border px-3 text-sm" />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium">VAT display</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border bg-slate-50 p-1">
                {(["INC_VAT", "EX_VAT"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setForm({ ...form, vatMode: mode })} className={`h-10 rounded-md text-sm font-semibold transition ${form.vatMode === mode ? "bg-white text-[#064071] shadow-sm" : "text-slate-500 hover:text-[#064071]"}`}>
                    {vatLabel(mode)}
                  </button>
                ))}
              </div>
            </fieldset>
            {form.kind === "HEALTH_PACKAGE" && (
              <label className="text-sm font-medium sm:col-span-2">
                Billing period
                <select value={form.billingPeriod} onChange={(event) => setForm({ ...form, billingPeriod: event.target.value as PricingForm["billingPeriod"] })} className="mt-2 h-10 w-full rounded-md border px-3 text-sm">
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONE_OFF">One off</option>
                </select>
              </label>
            )}
            <label className="text-sm font-medium sm:col-span-2">
              Description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} placeholder="What is included in this price?" className="mt-2 w-full rounded-md border p-3 text-sm" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
              <Plus className="size-4" />
              {editing ? "Save price" : "Add price"}
            </button>
          </div>
        </form>
      </Modal>

      {deleting && (
        <Modal open onClose={() => setDeleting(null)} title={`Delete ${deleting.name}?`} description="This pricing item will be removed from your public listing.">
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="h-10 rounded-md border px-4 text-sm font-semibold">Cancel</button>
            <button type="button" onClick={() => void remove()} className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white">Delete price</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
