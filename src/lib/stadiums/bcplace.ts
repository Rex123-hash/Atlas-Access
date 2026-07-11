import type { EdgeFeatures, VenueEdge, VenueGraph, VenueNode } from "../graph/types";

/**
 * BC Place (Vancouver) — an independent venue graph with its own topology and
 * section numbering. Built by hand for this project; like the other stadiums it
 * has a transit last-mile, a vertical core (lift / ramp / stairs) and a bowl,
 * tuned so the four accessibility profiles diverge. Uses local terminology
 * (washroom, first aid) in its node labels.
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
  { id: "bc_transit", label: "SkyTrain Stadium Stn", type: "transit", x: 70, y: 470 },
  { id: "bc_gate", label: "Gate A", type: "entrance", x: 250, y: 470 },
  { id: "bc_plaza", label: "Terry Fox Plaza", type: "concourse", x: 450, y: 470 },
  { id: "bc_ramp", label: "Accessible Ramp", type: "ramp", x: 330, y: 320 },
  { id: "bc_lift", label: "NE Elevator", type: "lift", x: 450, y: 300 },
  { id: "bc_stairs", label: "NE Stairs", type: "stairs", x: 570, y: 320 },
  { id: "bc_upper", label: "Upper Concourse", type: "concourse", x: 450, y: 130 },
  { id: "bc_mezz", label: "Quiet Lounge", type: "concourse", x: 660, y: 140 },
  { id: "bc_section", label: "Section 214 (Wheelchair Bay)", type: "section", x: 860, y: 160 },
  { id: "bc_washroom", label: "Accessible Washroom", type: "restroom", x: 680, y: 470 },
  { id: "bc_firstaid", label: "First Aid", type: "medical", x: 680, y: 320 },
  { id: "bc_quiet", label: "Sensory Room", type: "quiet_room", x: 250, y: 590 },
  { id: "bc_general", label: "Section 242", type: "section", x: 1030, y: 470 },
];

const EDGES: readonly VenueEdge[] = [
  { id: "bc_e_transit", from: "bc_transit", to: "bc_gate", distance: 140, features: feat({ ramp: true, incline: 0.03, crowdProne: true, sensory: 0.5 }) },
  { id: "bc_e_gate", from: "bc_gate", to: "bc_plaza", distance: 110, features: feat({ crowdProne: true, sensory: 0.6 }) },
  { id: "bc_e_quiet", from: "bc_gate", to: "bc_quiet", distance: 70, features: feat({ ramp: true, incline: 0.02, sensory: 0.05 }) },

  { id: "bc_e_lift_a", from: "bc_plaza", to: "bc_lift", distance: 15, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "bc_e_lift_b", from: "bc_lift", to: "bc_upper", distance: 20, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "bc_e_ramp_a", from: "bc_plaza", to: "bc_ramp", distance: 18, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "bc_e_ramp_b", from: "bc_ramp", to: "bc_upper", distance: 18, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "bc_e_stairs_a", from: "bc_plaza", to: "bc_stairs", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },
  { id: "bc_e_stairs_b", from: "bc_stairs", to: "bc_upper", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },

  { id: "bc_e_upper_direct", from: "bc_upper", to: "bc_section", distance: 205, features: feat({ crowdProne: true, sensory: 0.8 }) },
  { id: "bc_e_upper_mezz", from: "bc_upper", to: "bc_mezz", distance: 150, features: feat({ sensory: 0.1 }) },
  { id: "bc_e_mezz_sec", from: "bc_mezz", to: "bc_section", distance: 120, features: feat({ sensory: 0.1 }) },

  { id: "bc_e_washroom", from: "bc_plaza", to: "bc_washroom", distance: 100, features: feat() },
  { id: "bc_e_firstaid", from: "bc_washroom", to: "bc_firstaid", distance: 60, features: feat() },
  { id: "bc_e_general", from: "bc_washroom", to: "bc_general", distance: 150, features: feat({ sensory: 0.15 }) },
];

export const BCPLACE_GRAPH: VenueGraph = { nodes: NODES, edges: EDGES };

export const BCPLACE_DESTINATIONS = ["bc_section", "bc_general", "bc_washroom", "bc_firstaid", "bc_quiet"] as const;
