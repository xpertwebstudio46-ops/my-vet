"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Sponsorship } from "@/lib/api/types";

export default function LogoMarquee({ initialSponsors = [] }: { initialSponsors?: Sponsorship[] }) {
  const [sponsors, setSponsors] = useState<Sponsorship[]>(initialSponsors);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const current = await apiClient<Sponsorship[]>("/api/sponsorships", {
          cache: "no-store", signal: controller.signal,
        }, { authenticated: false });
        if (!controller.signal.aborted) setSponsors(current);
      } catch {
        // Preserve the last successful list during temporary API outages.
      } finally {
        pending = false;
      }
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 15_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  if (!sponsors.length) return null;
  const repetitions = Math.max(1, Math.ceil(6 / sponsors.length));
  const items = Array.from({ length: repetitions }, () => sponsors).flat();

  return (
    <section aria-label="Our sponsors" className="sponsor-marquee">
      <div className="sponsor-marquee-track" style={{ animationDuration: `${Math.max(25, items.length * 4)}s` }}>
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="sponsor-marquee-group">
            {items.map((sponsor, index) => {
              const duplicate = copy === 1 || index >= sponsors.length;
              const content = (
                <>
                  {sponsor.imageUrl && (
                    <img src={sponsor.imageUrl} alt="" className="h-16 w-40 object-contain" />
                  )}
                  <span className="text-center text-sm font-semibold text-[#064071]">{sponsor.name}</span>
                </>
              );
              const className = "sponsor-marquee-item";
              return sponsor.websiteUrl ? (
                <a key={`${sponsor.id}-${index}`} href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className={className} tabIndex={duplicate ? -1 : undefined} aria-hidden={duplicate ? true : undefined}>
                  {content}
                </a>
              ) : (
                <div key={`${sponsor.id}-${index}`} className={className} aria-hidden={duplicate ? true : undefined}>{content}</div>
              );
            })}
          </div>
        ))}
      </div>
      <style>{`
        .sponsor-marquee { width: 100%; overflow: hidden; background: white; padding: 40px 0; }
        .sponsor-marquee-track { display: flex; width: max-content; align-items: center; animation: sponsor-marquee 30s linear infinite; }
        .sponsor-marquee-group { display: flex; flex: 0 0 auto; align-items: center; min-width: 100vw; justify-content: space-around; }
        .sponsor-marquee-item { display: flex; flex: 0 0 176px; width: 176px; margin: 0 32px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
        .sponsor-marquee:hover .sponsor-marquee-track,
        .sponsor-marquee:focus-within .sponsor-marquee-track { animation-play-state: paused; }
        @keyframes sponsor-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sponsor-marquee { overflow-x: auto; }
          .sponsor-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
