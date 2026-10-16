"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/ui";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { discardUpload, uploadImage } from "@/lib/api/uploads";

type Practice = {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerWidth?: number | null;
  bannerHeight?: number | null;
  bannerObjectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

export function ProfileHeroCard() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  useEffect(() => {
    void apiClient<{ practice: Practice }>("/api/vet/dashboard")
      .then(({ practice: item }) => setPractice(item))
      .catch((caught) =>
        setError(
          caught instanceof ApiClientError
            ? caught.message
            : "Practice profile could not be loaded.",
        ),
      );
  }, []);

  useEffect(() => {
    const update = (event: Event) => {
      const saved = (event as CustomEvent<Partial<Practice>>).detail;
      setPractice((current) => current ? { ...current, ...saved } : current);
    };
    window.addEventListener("myvet:practice-updated", update);
    return () => window.removeEventListener("myvet:practice-updated", update);
  }, []);

  async function saveCover() {
    if (!practice || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiClient('/api/practices/' + practice.id, { method: 'PUT', body: JSON.stringify({ timezone: practice.timezone, bannerWidth: practice.bannerWidth ?? null, bannerHeight: practice.bannerHeight ?? null, bannerObjectFit: practice.bannerObjectFit ?? 'cover' }) });
      setMessage('Cover appearance saved to your public profile.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Cover appearance could not be saved.');
    } finally { setSaving(false); }
  }

  async function replaceImage(file: File, kind: "logo" | "banner") {
    setUploading(kind);
    setError("");
    let asset;
    try {
      asset = await uploadImage(
        file,
        kind === "logo" ? "PRACTICE_LOGO" : "PRACTICE_BANNER",
      );
      const media = await apiClient<{
        logoUrl: string | null;
        bannerUrl: string | null;
      }>("/api/vet/practice-media", {
        method: "PUT",
        body: JSON.stringify({ kind, assetId: asset.id }),
      });
      setPractice((current) => (current ? { ...current, ...media } : current));
    } catch (caught) {
      if (asset) await discardUpload(asset);
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : "Practice image could not be saved.",
      );
    } finally {
      setUploading(null);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      {error && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <div className="relative h-[340px] bg-slate-100 sm:h-[400px] lg:h-[460px] xl:h-[500px]">
        <Image
          src={practice?.bannerUrl || "/images/profile-banner.png"}
          alt="Practice cover"
          fill
          sizes="100vw"
          style={{ width: `${practice?.bannerWidth ?? 100}%`, height: `${practice?.bannerHeight ?? 100}%`, left: "50%", transform: "translateX(-50%)", objectFit: practice?.bannerObjectFit ?? "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
        <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#064071] shadow-md hover:bg-[#EEF7F5]">
          <Upload className="size-4" />
          {uploading === "banner" ? "Uploading..." : "Change cover"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={Boolean(uploading)}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void replaceImage(file, "banner");
            }}
          />
        </label>
        <span className="absolute -bottom-16 left-5 z-10 size-32 overflow-hidden rounded-md border-4 border-white bg-white shadow-lg shadow-black/20">
          <Image
            src={practice?.logoUrl || "/placeholder.svg"}
            alt={practice?.name || "Practice logo"}
            fill
            sizes="128px"
            className="object-contain p-1"
          />
          <label
            aria-label="Upload practice logo"
            className="absolute bottom-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-md bg-white text-[#064071] shadow-md hover:bg-[#EEF7F5]"
          >
            <Upload className="size-4" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={Boolean(uploading)}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void replaceImage(file, "logo");
              }}
            />
          </label>
        </span>
      </div>
      <div className="bg-white px-5 pb-5 pt-24">
        {practice && <div className="mb-5 grid gap-4 rounded-lg border bg-slate-50 p-4 sm:grid-cols-3">
          {(['bannerWidth', 'bannerHeight'] as const).map((key) => <label key={key} className="text-sm font-medium">{key === 'bannerWidth' ? 'Cover width (%)' : 'Cover height (%)'}<input type="number" min={1} max={100} step={1} value={practice[key] ?? ''} placeholder="100 (default)" onChange={(event) => setPractice({ ...practice, [key]: event.target.value === '' ? null : Number(event.target.value) })} className="mt-2 h-10 w-full rounded-md border bg-white px-3" /></label>)}
          <label className="text-sm font-medium">Image fit<select value={practice.bannerObjectFit ?? 'cover'} onChange={(event) => setPractice({ ...practice, bannerObjectFit: event.target.value as NonNullable<Practice['bannerObjectFit']> })} className="mt-2 h-10 w-full rounded-md border bg-white px-3">{(['cover', 'contain', 'fill', 'none', 'scale-down'] as const).map((fit) => <option key={fit} value={fit}>{fit}</option>)}</select></label>
          <p className="text-xs text-slate-500 sm:col-span-3">Dimensions are percentages of the cover area. Contain shows the whole image; cover fills the area and may crop it.</p>
          <button type="button" disabled={saving || [practice.bannerWidth, practice.bannerHeight].some((value) => value != null && (!Number.isInteger(value) || value < 1 || value > 100))} onClick={() => void saveCover()} className="rounded-md bg-[#01AEAD] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save cover settings'}</button>
          {message && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{message}</p>}
        </div>}
        <div className="max-w-3xl">
          <h2 className="dashboard-outfit text-[22px] font-semibold text-[#01AEAD]">
            {practice?.name || "Loading practice..."}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {practice?.description ||
              "Add a practice description from your profile details."}
          </p>
        </div>
      </div>
    </Card>
  );
}
