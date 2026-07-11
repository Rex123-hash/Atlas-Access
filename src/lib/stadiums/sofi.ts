import type { EdgeFeatures, VenueEdge, VenueGraph, VenueNode } from "../graph/types";

/**
 * SoFi Stadium (Inglewood / Los Angeles) — an independent venue graph with its
 * own topology and section numbering. Built by hand for this project; like the
 * other stadiums it has a transit last-mile, a vertical core (lift / ramp /
 * stairs) and a bowl, tuned so the four accessibility profiles diverge.
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

const NODES: readonly VenueNode[] = [
  { id: "sf_transit", label: "Metro / Rideshare Hub", type: "transit", x: 70, y: 470 },
  { id: "sf_gate", label: "Entry Gate G", type: "entrance", x: 250, y: 470 },
  { id: "sf_plaza", label: "AA Plaza", type: "concourse", x: 450, y: 470 },
  { id: "sf_ramp", label: "Accessible Ramp", type: "ramp", x: 330, y: 320 },
  { id: "sf_lift", label: "North Elevator", type: "lift", x: 450, y: 300 },
  { id: "sf_stairs", label: "North Stairs", type: "stairs", x: 570, y: 320 },
  { id: "sf_upper", label: "Upper Concourse", type: "concourse", x: 450, y: 130 },
  { id: "sf_mezz", label: "Calm Mezzanine", type: "concourse", x: 660, y: 140 },
  { id: "sf_section", label: "Section 240 (Wheelchair Bay)", type: "section", x: 860, y: 160 },
  { id: "sf_restroom", label: "Accessible Restroom", type: "restroom", x: 680, y: 470 },
  { id: "sf_medical", label: "Medical Point", type: "medical", x: 680, y: 320 },
  { id: "sf_quiet", label: "Sensory Quiet Room", type: "quiet_room", x: 250, y: 590 },
  { id: "sf_general", label: "Section 130", type: "section", x: 1030, y: 470 },
];

const EDGES: readonly VenueEdge[] = [
  { id: "sf_e_transit", from: "sf_transit", to: "sf_gate", distance: 160, features: feat({ ramp: true, incline: 0.03, crowdProne: true, sensory: 0.5 }) },
  { id: "sf_e_gate", from: "sf_gate", to: "sf_plaza", distance: 120, features: feat({ crowdProne: true, sensory: 0.6 }) },
  { id: "sf_e_quiet", from: "sf_gate", to: "sf_quiet", distance: 70, features: feat({ ramp: true, incline: 0.02, sensory: 0.05 }) },

  { id: "sf_e_lift_a", from: "sf_plaza", to: "sf_lift", distance: 16, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "sf_e_lift_b", from: "sf_lift", to: "sf_upper", distance: 20, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "sf_e_ramp_a", from: "sf_plaza", to: "sf_ramp", distance: 20, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "sf_e_ramp_b", from: "sf_ramp", to: "sf_upper", distance: 20, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "sf_e_stairs_a", from: "sf_plaza", to: "sf_stairs", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },
  { id: "sf_e_stairs_b", from: "sf_stairs", to: "sf_upper", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },

  { id: "sf_e_upper_direct", from: "sf_upper", to: "sf_section", distance: 210, features: feat({ crowdProne: true, sensory: 0.8 }) },
  { id: "sf_e_upper_mezz", from: "sf_upper", to: "sf_mezz", distance: 150, features: feat({ sensory: 0.1 }) },
  { id: "sf_e_mezz_sec", from: "sf_mezz", to: "sf_section", distance: 120, features: feat({ sensory: 0.1 }) },

  { id: "sf_e_restroom", from: "sf_plaza", to: "sf_restroom", distance: 100, features: feat() },
  { id: "sf_e_medical", from: "sf_restroom", to: "sf_medical", distance: 60, features: feat() },
  { id: "sf_e_general", from: "sf_restroom", to: "sf_general", distance: 150, features: feat({ sensory: 0.15 }) },
];

export const SOFI_GRAPH: VenueGraph = { nodes: NODES, edges: EDGES };

export const SOFI_DESTINATIONS = ["sf_section", "sf_general", "sf_restroom", "sf_medical", "sf_quiet"] as const;
