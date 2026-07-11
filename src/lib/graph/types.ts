/**
 * Domain types for the venue accessibility graph.
 *
 * Design rule (mirrors the reference projects): this module is PURE data +
 * types. No I/O, no framework imports. Every routing decision is deterministic
 * and unit-testable from these structures alone.
 */

export type NodeType =
  | "entrance"
  | "concourse"
  | "lift"
  | "ramp"
  | "stairs"
  | "section"
  | "restroom"
  | "medical"
  | "quiet_room"
  | "transit";

/** A physical point in the venue. Coordinates are in metres, used both for the
 * SVG map and as an admissible A* heuristic (straight-line distance). */
export interface VenueNode {
  readonly id: string;
  readonly label: string;
  readonly type: NodeType;
  readonly x: number;
  readonly y: number;
}

/** Physical characteristics of a passage, consumed by profile cost functions. */
export interface EdgeFeatures {
  /** Passage includes a flight of stairs (impassable for wheelchair users). */
  readonly stairs: boolean;
  /** Passage is a graded ramp. */
  readonly ramp: boolean;
  /** Passage uses a lift (may be closed in real time). */
  readonly lift: boolean;
  /** Gradient 0..1 (0 = flat). Penalises manual-wheelchair effort. */
  readonly incline: number;
  /** Passage is prone to dense crowds (disorienting / unsafe for some fans). */
  readonly crowdProne: boolean;
  /** Sensory intensity 0..1 (noise, light). Penalised by the sensory profile. */
  readonly sensory: number;
}

/** A bidirectional passage between two nodes. */
export interface VenueEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  /** Physical length in metres (> 0). */
  readonly distance: number;
  readonly features: EdgeFeatures;
}

export interface VenueGraph {
  readonly nodes: readonly VenueNode[];
  readonly edges: readonly VenueEdge[];
}

/** Real-time closures (a lift out of service, a corridor blocked by an
 * incident). Supplied per-request so routing stays a pure function. */
export interface Closures {
  readonly closedEdgeIds: ReadonlySet<string>;
  readonly closedNodeIds: ReadonlySet<string>;
}

export const NO_CLOSURES: Closures = {
  closedEdgeIds: new Set<string>(),
  closedNodeIds: new Set<string>(),
};
