import type { VenueEdge, VenueGraph } from "../graph/types";
import { getNode } from "../graph/venue";
import type { AccessibilityProfile } from "./profiles";

/** The kind of movement a leg represents — drives deterministic localization. */
export type RouteMoveKind = "start" | "lift" | "ramp" | "stairs" | "continue" | "already";

/** Structured, language-neutral description of a leg, localized at render time. */
export interface RouteMove {
  readonly kind: RouteMoveKind;
  readonly place: string;
  readonly distance: number;
}

export interface RouteStep {
  readonly nodeId: string;
  readonly label: string;
  /** English instruction (fallback + screen-reader default). Localized via `move`. */
  readonly instruction: string;
  readonly distanceMeters: number;
  /** Language-neutral descriptor used to render this leg in any locale. */
  readonly move: RouteMove;
}

/** Turn a node path + the edges used into spoken/written turn-by-turn steps. */
export function generateInstructions(
  graph: VenueGraph,
  path: readonly string[],
  edgesUsed: readonly VenueEdge[],
): RouteStep[] {
  if (path.length === 0) return [];

  const startLabel = getNode(graph, path[0]!)?.label ?? path[0]!;
  const steps: RouteStep[] = [
    {
      nodeId: path[0]!,
      label: startLabel,
      instruction: `Start at ${startLabel}.`,
      distanceMeters: 0,
      move: { kind: "start", place: startLabel, distance: 0 },
    },
  ];

  for (let i = 1; i < path.length; i++) {
    const toId = path[i]!;
    const toLabel = getNode(graph, toId)?.label ?? toId;
    const edge = edgesUsed[i - 1]!;
    const d = Math.round(edge.distance);
    const f = edge.features;

    let instruction: string;
    let kind: RouteMoveKind;
    if (f.lift) {
      instruction = `Take the lift to ${toLabel} (${d} m).`;
      kind = "lift";
    } else if (f.ramp) {
      instruction = `Follow the ramp to ${toLabel} (${d} m).`;
      kind = "ramp";
    } else if (f.stairs) {
      instruction = `Take the stairs to ${toLabel} (${d} m).`;
      kind = "stairs";
    } else {
      instruction = `Continue ${d} m to ${toLabel}.`;
      kind = "continue";
    }

    steps.push({ nodeId: toId, label: toLabel, instruction, distanceMeters: d, move: { kind, place: toLabel, distance: d } });
  }

  return steps;
}

/** A short, deterministic explanation of WHY this route was chosen — surfaced
 * to the fan and used as the accessible summary announcement. */
export function describeRoute(
  profile: AccessibilityProfile,
  edgesUsed: readonly VenueEdge[],
  closuresAvoided: number,
): string {
  const parts: string[] = [];
  const usedLift = edgesUsed.some((e) => e.features.lift);
  const usedRamp = edgesUsed.some((e) => e.features.ramp);
  const usedStairs = edgesUsed.some((e) => e.features.stairs);

  switch (profile.id) {
    case "wheelchair":
      parts.push("Step-free route");
      break;
    case "blind":
      parts.push("Calm, low-crowd route");
      break;
    case "sensory":
      parts.push("Low-sensory route");
      break;
    case "standard":
      parts.push("Shortest route");
      break;
  }

  const via: string[] = [];
  if (usedLift) via.push("lift");
  if (usedRamp) via.push("ramp");
  if (usedStairs) via.push("stairs");
  if (via.length > 0) parts.push(`via ${via.join(" and ")}`);

  if (closuresAvoided > 0) {
    parts.push(`rerouted around ${closuresAvoided} closed passage${closuresAvoided > 1 ? "s" : ""}`);
  }

  return `${parts.join(", ")}.`;
}

/** Structured "why this route" descriptor for deterministic localization —
 * mirrors {@link describeRoute} but language-neutral. */
export function routeReason(
  profile: AccessibilityProfile,
  edgesUsed: readonly VenueEdge[],
  closuresAvoided: number,
): { profileId: AccessibilityProfile["id"]; via: ("lift" | "ramp" | "stairs")[]; closuresAvoided: number } {
  const via: ("lift" | "ramp" | "stairs")[] = [];
  if (edgesUsed.some((e) => e.features.lift)) via.push("lift");
  if (edgesUsed.some((e) => e.features.ramp)) via.push("ramp");
  if (edgesUsed.some((e) => e.features.stairs)) via.push("stairs");
  return { profileId: profile.id, via, closuresAvoided };
}
