import type { VenueEdge } from "../graph/types";

/**
 * Accessibility profiles turn physical passage features into a traversal cost.
 * Returning `Infinity` marks a passage impassable for that profile.
 *
 * This is the heart of "accessibility-first" routing: the SAME graph yields
 * genuinely different, safe routes per fan. Pure functions → trivially testable.
 */

export type ProfileId = "wheelchair" | "blind" | "sensory" | "standard";

export interface AccessibilityProfile {
  readonly id: ProfileId;
  readonly label: string;
  readonly description: string;
  /** Cost of traversing `edge`. `Infinity` = cannot use this passage. */
  readonly edgeCost: (edge: VenueEdge) => number;
}

const IMPASSABLE = Number.POSITIVE_INFINITY;

/** Standard shortest-path: cost is simply physical distance. */
const standard: AccessibilityProfile = {
  id: "standard",
  label: "Standard",
  description: "Shortest walking route.",
  edgeCost: (edge) => edge.distance,
};

/**
 * Manual/powered wheelchair: stairs are impassable; steeper inclines cost more
 * effort. Lifts and ramps are preferred implicitly because stairs are excluded.
 */
const wheelchair: AccessibilityProfile = {
  id: "wheelchair",
  label: "Wheelchair / step-free",
  description: "Avoids all stairs; prefers lifts and gentle ramps.",
  edgeCost: (edge) => {
    if (edge.features.stairs) return IMPASSABLE;
    // Each unit of gradient adds effort proportional to distance.
    return edge.distance * (1 + edge.features.incline * 6);
  },
};

/**
 * Blind / low-vision: dense, chaotic crowds are disorienting and unsafe, so
 * heavily penalise crowd-prone passages even when they are physically shorter.
 * Stairs are usable (with a small penalty for caution).
 */
const blind: AccessibilityProfile = {
  id: "blind",
  label: "Blind / low vision",
  description: "Prefers calm, predictable passages; avoids dense crowds.",
  edgeCost: (edge) => {
    const crowdPenalty = edge.features.crowdProne ? 2.6 : 1;
    const stairsPenalty = edge.features.stairs ? 1.4 : 1;
    return edge.distance * crowdPenalty * stairsPenalty;
  },
};

/**
 * Sensory-sensitive (e.g. autistic fans): minimise noise/light exposure and
 * crowding, accepting a longer physical route for a calmer one.
 */
const sensory: AccessibilityProfile = {
  id: "sensory",
  label: "Low-sensory",
  description: "Minimises noise, bright light and crowding.",
  edgeCost: (edge) => {
    const sensoryPenalty = 1 + edge.features.sensory * 4;
    const crowdPenalty = edge.features.crowdProne ? 2.2 : 1;
    return edge.distance * sensoryPenalty * crowdPenalty;
  },
};

export const PROFILES: Record<ProfileId, AccessibilityProfile> = {
  standard,
  wheelchair,
  blind,
  sensory,
};

export function getProfile(id: ProfileId): AccessibilityProfile {
  return PROFILES[id];
}
