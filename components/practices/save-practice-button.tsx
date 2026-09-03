"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PawPrint } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type { Practice } from "@/lib/api/types";
import { readSavedPracticeIds, writeSavedPracticeIds } from "@/lib/saved-practice-storage";

let savedIdsCache: Set<string> | null = null;
let savedIdsRequest: Promise<Set<string>> | null = null;

async function loadSavedPracticeIds() {
  if (!savedIdsRequest) {
    savedIdsRequest = apiClient<Practice[]>("/api/practices/saved").then((items) => {
      const ids = new Set(items.map((item) => item.id));
      savedIdsCache = ids;
      writeSavedPracticeIds([...ids]);
      return ids;
    }).finally(() => {
      savedIdsRequest = null;
    });
  }
  return savedIdsRequest;
}

export function SavePracticeButton({
  practiceId,
  className,
  iconClassName,
}: {
  practiceId: string;
  className: string;
  iconClassName?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(() => readSavedPracticeIds().includes(practiceId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    void loadSavedPracticeIds()
      .then((ids) => {
        if (active) setSaved(ids.has(practiceId));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [loading, practiceId, user]);

  async function toggleSaved() {
    if (loading || saving) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const result = await apiClient<{ saved: boolean }>(`/api/practices/${practiceId}/save`, { method: "POST" });
      setSaved(result.saved);
      const ids = new Set(savedIdsCache ?? readSavedPracticeIds());
      if (result.saved) ids.add(practiceId);
      else ids.delete(practiceId);
      savedIdsCache = ids;
      writeSavedPracticeIds([...ids]);
    } catch (caught) {
      setMessage(caught instanceof ApiClientError ? caught.message : "Practice could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved practices" : "Save to saved practices"}
      aria-pressed={saved}
      title={message || (saved ? "Saved" : "Save practice")}
      disabled={saving}
      onClick={() => void toggleSaved()}
      className={className}
    >
      <PawPrint className={`${iconClassName ?? "h-3.5 w-3.5"} ${saved ? "fill-[#01AEAD] text-[#01AEAD]" : "text-slate-500"}`} />
    </button>
  );
}
