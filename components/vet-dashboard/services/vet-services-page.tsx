"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  currency: string;
  active: boolean;
  sortOrder: number;
};

export function VetServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [error, setError] = useState("");
  useEffect(() => {
    void apiClient<Service[]>("/api/vet/services")
      .then(setItems)
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Services could not be loaded.",
        ),
      );
  }, []);
  async function add(event: React.FormEvent) {
    event.preventDefault();
    try {
      const item = await apiClient<Service>("/api/vet/services", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price ? Number(form.price) : null,
          currency: "GBP",
          active: true,
          sortOrder: items.length,
        }),
      });
      setItems((current) => [...current, item]);
      setForm({ name: "", description: "", price: "" });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Service could not be added.",
      );
    }
  }
  async function update(item: Service, data: Partial<Service>) {
    try {
      const saved = await apiClient<Service>(`/api/vet/services/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setItems((current) =>
        current.map((value) => (value.id === item.id ? saved : value)),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Service could not be updated.",
      );
    }
  }
  async function remove(item: Service) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await apiClient(`/api/vet/services/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((value) => value.id !== item.id));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Service could not be deleted.",
      );
    }
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <h1 className="dashboard-heading text-5xl">Services</h1>
        <p className="text-sm text-muted-foreground">
          Services displayed on your public listing.
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
        onSubmit={(event) => void add(event)}
        className="grid gap-3 rounded-xl bg-white p-5 md:grid-cols-[1fr_2fr_140px_auto]"
      >
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Service name"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
          className="h-10 rounded-md border px-3 text-sm"
        />
        <button className="inline-flex items-center gap-2 rounded-md bg-[#01AEAD] px-4 text-sm font-semibold text-white">
          <Plus className="size-4" />
          Add
        </button>
      </form>
      <Card className="overflow-hidden p-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.description || "No description"}
                {item.price ? ` - ${item.currency} ${item.price}` : ""}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={(event) =>
                  void update(item, { active: event.target.checked })
                }
              />
              Visible
            </label>
            <button
              onClick={() => {
                const name = window.prompt("Service name:", item.name);
                if (name) void update(item, { name });
              }}
              className="rounded-md border px-3 py-2 text-xs font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => void remove(item)}
              className="rounded-md p-2 text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {!items.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No services added.
          </p>
        )}
      </Card>
    </div>
  );
}
