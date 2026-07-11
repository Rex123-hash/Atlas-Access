import type { CrowdZone, Stadium } from "../stadiums";

export interface CrowdResult {
  /** Zones sorted from least to most crowded. */
  readonly zones: readonly CrowdZone[];
  readonly bestZoneId: string | null;
  readonly summary: string;
}

/** Deterministic crowd/gate recommendation: rank zones by density and suggest
 * the calmest entry. A production deploy would stream `density` live. */
export function recommendEntry(stadium: Stadium): CrowdResult {
  const zones = [...stadium.zones].sort((a, b) => a.density - b.density);
  const best = zones[0];
  if (!best) {
    return { zones, bestZoneId: null, summary: "No live crowd data is available for this stadium yet." };
  }
  const pct = Math.round(best.density * 100);
  return {
    zones,
    bestZoneId: best.id,
    summary: `${best.label} is the calmest entry right now (about ${pct}% full). Heading there will save you time and crowding.`,
  };
}
