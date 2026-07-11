import type { EdgeFeatures, VenueEdge, VenueGraph, VenueNode } from "./types";

/**
 * A representative sample stadium graph (one concourse level + last-mile
 * transit). Realistic enough to demonstrate step-free routing, lift closures,
 * crowd avoidance and sensory-aware routing, small enough to reason about in
 * tests.
 *
 * Layout (approx metres, origin top-left):
 *
 *   [Transit Hub] --150m ramp--> [West Entrance] ----> concourse ...
 *
 * A wheelchair user must never be routed over `stairs` edges; when a lift is
 * closed, the engine must find a ramp alternative or report no route.
 */

function feat(partial: Partial<EdgeFeatures> = {}): EdgeFeatures {
  return {
    stairs: false,
    ramp: false,
    lift: false,
    incline: 0,
    crowdProne: false,
    sensory: 0.2,
    ...partial,
  };
}

// Coordinates are for display + the A* heuristic only; routing correctness
// depends solely on edge `distance`, so the schematic can be laid out for
// readability without affecting any route.
const NODES: readonly VenueNode[] = [
  { id: "transit", label: "Metro / Transit Hub", type: "transit", x: 70, y: 470 },
  { id: "west_gate", label: "West Entrance", type: "entrance", x: 250, y: 470 },
  { id: "concourse_w", label: "West Concourse", type: "concourse", x: 450, y: 470 },
  { id: "ramp_w", label: "West Ramp", type: "ramp", x: 330, y: 320 },
  { id: "lift_w", label: "West Lift", type: "lift", x: 450, y: 300 },
  { id: "stairs_w", label: "West Stairs", type: "stairs", x: 570, y: 320 },
  { id: "concourse_upper", label: "Upper Concourse", type: "concourse", x: 450, y: 130 },
  { id: "mezzanine", label: "Quiet Mezzanine", type: "concourse", x: 660, y: 140 },
  { id: "section_112", label: "Section 112 (Wheelchair Bay)", type: "section", x: 860, y: 160 },
  { id: "restroom", label: "Accessible Restroom", type: "restroom", x: 680, y: 470 },
  { id: "medical", label: "Medical Point", type: "medical", x: 680, y: 320 },
  { id: "quiet", label: "Sensory Quiet Room", type: "quiet_room", x: 250, y: 590 },
  { id: "concourse_e", label: "East Concourse", type: "concourse", x: 880, y: 470 },
  { id: "section_130", label: "Section 130", type: "section", x: 1030, y: 470 },
];

const EDGES: readonly VenueEdge[] = [
  { id: "e_transit_gate", from: "transit", to: "west_gate", distance: 150, features: feat({ ramp: true, incline: 0.03, crowdProne: true, sensory: 0.5 }) },
  { id: "e_gate_concourse", from: "west_gate", to: "concourse_w", distance: 110, features: feat({ crowdProne: true, sensory: 0.6 }) },

  // Three ways up to the upper concourse, tuned so each profile diverges:
  //   • lift   — step-free, calm (wheelchair prefers)
  //   • ramp   — step-free, lowest sensory (low-sensory profile prefers)
  //   • stairs — shortest but noisy and impassable for wheelchair users
  //             (standard prefers for speed; blind tolerates)
  { id: "e_lift", from: "concourse_w", to: "lift_w", distance: 15, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "e_lift_upper", from: "lift_w", to: "concourse_upper", distance: 20, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "e_ramp", from: "concourse_w", to: "ramp_w", distance: 19, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "e_ramp_upper", from: "ramp_w", to: "concourse_upper", distance: 19, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "e_stairs", from: "concourse_w", to: "stairs_w", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },
  { id: "e_stairs_upper", from: "stairs_w", to: "concourse_upper", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },

  { id: "e_concourse_restroom", from: "concourse_w", to: "restroom", distance: 100, features: feat() },
  { id: "e_restroom_medical", from: "restroom", to: "medical", distance: 60, features: feat() },
  { id: "e_concourse_quiet", from: "west_gate", to: "quiet", distance: 70, features: feat({ ramp: true, incline: 0.02, sensory: 0.05 }) },

  // Two ways across the upper level to Section 112: a short crowded/loud
  // corridor, and a longer calm route via the Quiet Mezzanine.
  { id: "e_upper_112", from: "concourse_upper", to: "section_112", distance: 210, features: feat({ crowdProne: true, sensory: 0.8 }) },
  { id: "e_upper_mezz", from: "concourse_upper", to: "mezzanine", distance: 150, features: feat({ sensory: 0.1 }) },
  { id: "e_mezz_112", from: "mezzanine", to: "section_112", distance: 120, features: feat({ sensory: 0.1 }) },
  { id: "e_concourse_east", from: "concourse_w", to: "concourse_e", distance: 200, features: feat({ crowdProne: true, sensory: 0.8 }) },
  { id: "e_east_130", from: "concourse_e", to: "section_130", distance: 100, features: feat({ crowdProne: true, sensory: 0.7 }) },
  // A quieter, longer bypass to the east side (lower sensory, no crowd).
  { id: "e_restroom_east", from: "restroom", to: "concourse_e", distance: 140, features: feat({ sensory: 0.15 }) },
];

export const SAMPLE_VENUE: VenueGraph = { nodes: NODES, edges: EDGES };

/** Destinations a fan can pick, in display order. */
export const DESTINATIONS = [
  "section_112",
  "section_130",
  "restroom",
  "medical",
  "quiet",
] as const;

export function getNode(graph: VenueGraph, id: string): VenueNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}
