"use client";

import { Users } from "lucide-react";
import { getStadium } from "@/lib/stadiums";
import { recommendEntry } from "@/lib/concierge/crowd";
import { renderCrowdSummary, t } from "@/lib/i18n";
import { useApp } from "../../app-state";

export default function CrowdTool() {
  const { stadiumId, locale } = useApp();
  const stadium = getStadium(stadiumId)!;
  const crowd = recommendEntry(stadium);

  const best = crowd.bestZoneId ? crowd.zones.find((z) => z.id === crowd.bestZoneId) : null;
  const summary = renderCrowdSummary(best ? { zone: best.label, pct: Math.round(best.density * 100) } : null, locale);

  return (
    <div className="space-y-4">
      <div className="card-surface p-4">
        <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-text">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          {summary}
        </p>
      </div>

      {crowd.zones.length > 0 && (
        <div className="card-surface p-4">
          <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-muted">{t("zonesHeading", locale)}</h2>
          <ul className="space-y-3">
            {crowd.zones.map((z) => {
              const pct = Math.round(z.density * 100);
              const busy = z.density > 0.7;
              return (
                <li key={z.id}>
                  <div className="flex justify-between text-xs font-semibold text-text">
                    <span className={z.id === crowd.bestZoneId ? "text-accent" : undefined}>{z.label}</span>
                    <span className="text-muted">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: busy ? "var(--danger)" : "var(--accent)" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
