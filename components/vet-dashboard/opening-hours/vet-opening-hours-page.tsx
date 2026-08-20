"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";

type Hours = {
  id?: string;
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};
type Holiday = {
  id: string;
  date: string;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
};
type Emergency = {
  enabled: boolean;
  phone: string | null;
  instructions: string | null;
};
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const defaults: Hours[] = days.map((_, dayOfWeek) => ({
  dayOfWeek,
  isClosed: dayOfWeek === 0,
  opensAt: dayOfWeek === 0 ? null : "09:00",
  closesAt: dayOfWeek === 0 ? null : "17:00",
}));

export function VetOpeningHoursPage() {
  const [hours, setHours] = useState<Hours[]>(defaults);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [emergency, setEmergency] = useState<Emergency>({
    enabled: false,
    phone: null,
    instructions: null,
  });
  const [holiday, setHoliday] = useState({ date: "", note: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    void apiClient<{
      openingHours: Hours[];
      holidayHours: Holiday[];
      emergencyHours: Emergency | null;
    }>("/api/vet/opening-hours")
      .then((result) => {
        if (result.openingHours.length === 7) setHours(result.openingHours);
        setHolidays(result.holidayHours);
        if (result.emergencyHours) setEmergency(result.emergencyHours);
      })
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Opening hours could not be loaded.",
        ),
      );
  }, []);
  function update(day: number, change: Partial<Hours>) {
    setHours((current) =>
      current.map((item) =>
        item.dayOfWeek === day ? { ...item, ...change } : item,
      ),
    );
  }
  async function save() {
    try {
      await Promise.all([
        apiClient("/api/vet/opening-hours", {
          method: "PUT",
          body: JSON.stringify(
            hours.map(({ dayOfWeek, isClosed, opensAt, closesAt }) => ({
              dayOfWeek,
              isClosed,
              opensAt: isClosed ? null : opensAt,
              closesAt: isClosed ? null : closesAt,
            })),
          ),
        }),
        apiClient("/api/vet/emergency-hours", {
          method: "PUT",
          body: JSON.stringify(emergency),
        }),
      ]);
      setMessage("Opening and emergency hours saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Hours could not be saved.",
      );
    }
  }
  async function addHoliday(event: React.FormEvent) {
    event.preventDefault();
    try {
      const item = await apiClient<Holiday>("/api/vet/holiday-hours", {
        method: "POST",
        body: JSON.stringify({
          date: holiday.date,
          isClosed: true,
          note: holiday.note || null,
        }),
      });
      setHolidays((current) => [...current, item]);
      setHoliday({ date: "", note: "" });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Holiday could not be added.",
      );
    }
  }
  async function removeHoliday(item: Holiday) {
    try {
      await apiClient(`/api/vet/holiday-hours/${item.id}`, { method: "DELETE" });
      setHolidays((current) => current.filter((value) => value.id !== item.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Holiday could not be deleted.");
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg">
        <div>
          <h1 className="dashboard-heading text-5xl">Opening hours</h1>
          <p className="text-sm text-muted-foreground">
            Hours used on the public practice profile.
          </p>
        </div>
        <button
          onClick={() => void save()}
          className="rounded-md bg-[#01AEAD] px-4 py-3 text-sm font-semibold text-white"
        >
          Save hours
        </button>
      </div>
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <Card className="overflow-hidden p-0">
        {[...hours]
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((item) => (
            <div
              key={item.dayOfWeek}
              className="grid gap-3 border-b p-4 sm:grid-cols-[140px_100px_1fr_1fr] sm:items-center"
            >
              <strong>{days[item.dayOfWeek]}</strong>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!item.isClosed}
                  onChange={(e) =>
                    update(item.dayOfWeek, { isClosed: !e.target.checked })
                  }
                />
                Open
              </label>
              <input
                type="time"
                disabled={item.isClosed}
                value={item.opensAt ?? ""}
                onChange={(e) =>
                  update(item.dayOfWeek, { opensAt: e.target.value })
                }
                className="h-10 rounded-md border px-3 disabled:bg-slate-100"
              />
              <input
                type="time"
                disabled={item.isClosed}
                value={item.closesAt ?? ""}
                onChange={(e) =>
                  update(item.dayOfWeek, { closesAt: e.target.value })
                }
                className="h-10 rounded-md border px-3 disabled:bg-slate-100"
              />
            </div>
          ))}
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Holiday closures</h2>
          <form
            onSubmit={(e) => void addHoliday(e)}
            className="mt-4 grid gap-3"
          >
            <input
              required
              type="date"
              value={holiday.date}
              onChange={(e) => setHoliday({ ...holiday, date: e.target.value })}
              className="h-10 rounded-md border px-3"
            />
            <input
              value={holiday.note}
              onChange={(e) => setHoliday({ ...holiday, note: e.target.value })}
              placeholder="Note"
              className="h-10 rounded-md border px-3 text-sm"
            />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-semibold">
              <Plus className="size-4" />
              Add closure
            </button>
          </form>
          {holidays.map((item) => (
            <div
              key={item.id}
              className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"
            >
              <span>
                {new Date(item.date).toLocaleDateString("en-GB")} &middot;{" "}
                {item.note || "Closed"}
              </span>
              <button
                onClick={() => void removeHoliday(item)}
                className="text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </Card>
        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">Emergency contact</h2>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={emergency.enabled}
              onChange={(e) =>
                setEmergency({ ...emergency, enabled: e.target.checked })
              }
            />
            Enable emergency information
          </label>
          <input
            value={emergency.phone ?? ""}
            onChange={(e) =>
              setEmergency({ ...emergency, phone: e.target.value || null })
            }
            placeholder="Emergency phone"
            className="h-10 rounded-md border px-3 text-sm"
          />
          <textarea
            value={emergency.instructions ?? ""}
            onChange={(e) =>
              setEmergency({
                ...emergency,
                instructions: e.target.value || null,
              })
            }
            placeholder="Instructions"
            rows={4}
            className="rounded-md border p-3 text-sm"
          />
        </Card>
      </div>
    </div>
  );
}
