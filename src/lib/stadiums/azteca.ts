import type { EdgeFeatures, VenueEdge, VenueGraph, VenueNode } from "../graph/types";

/**
 * Estadio Azteca (Mexico City) — an independent venue graph with its own
 * topology, Spanish node labels and section numbering. Built by hand for this
 * project; shares no data with the MetLife graph beyond the common idea that
 * stadiums have concourses, vertical cores (lift/ramp/stairs) and seating bowls.
 * Tuned, like all our graphs, so the four accessibility profiles diverge.
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
  { id: "az_metro", label: "Metro Línea 2", type: "transit", x: 70, y: 470 },
  { id: "az_gate", label: "Puerta 4", type: "entrance", x: 250, y: 470 },
  { id: "az_explanada", label: "Explanada Sur", type: "concourse", x: 450, y: 470 },
  { id: "az_rampa", label: "Rampa Accesible", type: "ramp", x: 330, y: 320 },
  { id: "az_ascensor", label: "Ascensor Sur", type: "lift", x: 450, y: 300 },
  { id: "az_escaleras", label: "Escaleras Sur", type: "stairs", x: 570, y: 320 },
  { id: "az_nivel2", label: "Nivel Cabañas", type: "concourse", x: 450, y: 130 },
  { id: "az_palco", label: "Palco Tranquilo", type: "concourse", x: 660, y: 140 },
  { id: "az_cabecera", label: "Cabecera Sur 24", type: "section", x: 860, y: 160 },
  { id: "az_bano", label: "Baño Accesible", type: "restroom", x: 680, y: 470 },
  { id: "az_medico", label: "Punto Médico", type: "medical", x: 680, y: 320 },
  { id: "az_sensorial", label: "Sala Sensorial", type: "quiet_room", x: 250, y: 590 },
  { id: "az_general", label: "General 105", type: "section", x: 1030, y: 470 },
];

const EDGES: readonly VenueEdge[] = [
  { id: "az_e_metro", from: "az_metro", to: "az_gate", distance: 150, features: feat({ ramp: true, incline: 0.03, crowdProne: true, sensory: 0.5 }) },
  { id: "az_e_gate", from: "az_gate", to: "az_explanada", distance: 110, features: feat({ crowdProne: true, sensory: 0.6 }) },
  { id: "az_e_quiet", from: "az_gate", to: "az_sensorial", distance: 70, features: feat({ ramp: true, incline: 0.02, sensory: 0.05 }) },

  { id: "az_e_lift_a", from: "az_explanada", to: "az_ascensor", distance: 15, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "az_e_lift_b", from: "az_ascensor", to: "az_nivel2", distance: 20, features: feat({ lift: true, sensory: 0.1 }) },
  { id: "az_e_ramp_a", from: "az_explanada", to: "az_rampa", distance: 19, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "az_e_ramp_b", from: "az_rampa", to: "az_nivel2", distance: 19, features: feat({ ramp: true, incline: 0.05, sensory: 0.05 }) },
  { id: "az_e_stairs_a", from: "az_explanada", to: "az_escaleras", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },
  { id: "az_e_stairs_b", from: "az_escaleras", to: "az_nivel2", distance: 12, features: feat({ stairs: true, sensory: 0.6 }) },

  { id: "az_e_upper_direct", from: "az_nivel2", to: "az_cabecera", distance: 210, features: feat({ crowdProne: true, sensory: 0.8 }) },
  { id: "az_e_upper_mezz", from: "az_nivel2", to: "az_palco", distance: 150, features: feat({ sensory: 0.1 }) },
  { id: "az_e_mezz_sec", from: "az_palco", to: "az_cabecera", distance: 120, features: feat({ sensory: 0.1 }) },

  { id: "az_e_bano", from: "az_explanada", to: "az_bano", distance: 100, features: feat({ sensory: 0.2 }) },
  { id: "az_e_medico", from: "az_bano", to: "az_medico", distance: 60, features: feat({ sensory: 0.2 }) },
  { id: "az_e_general", from: "az_bano", to: "az_general", distance: 150, features: feat({ sensory: 0.15 }) },
];

export const AZTECA_GRAPH: VenueGraph = { nodes: NODES, edges: EDGES };

export const AZTECA_DESTINATIONS = ["az_cabecera", "az_general", "az_bano", "az_medico", "az_sensorial"] as const;
