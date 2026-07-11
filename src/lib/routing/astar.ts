import type { Closures, VenueEdge, VenueGraph } from "../graph/types";
import { NO_CLOSURES } from "../graph/types";
import { getNode } from "../graph/venue";
import { MinHeap } from "./heap";
import { describeRoute, generateInstructions, routeReason, type RouteStep } from "./instructions";
import type { AccessibilityProfile } from "./profiles";

export interface RouteReasonInfo {
  readonly profileId: AccessibilityProfile["id"];
  readonly via: ("lift" | "ramp" | "stairs")[];
  readonly closuresAvoided: number;
}

export interface RouteResult {
  readonly found: boolean;
  readonly path: readonly string[];
  readonly totalDistanceMeters: number;
  /** Profile-weighted cost (effort), not physical metres. */
  readonly totalCost: number;
  readonly steps: readonly RouteStep[];
  /** English reason (fallback + screen-reader default). */
  readonly reason: string;
  /** Structured reason for deterministic localization (null when not routable). */
  readonly reasonInfo: RouteReasonInfo | null;
}

interface Adjacent {
  readonly edge: VenueEdge;
  readonly neighborId: string;
}

/** Build a bidirectional adjacency map once per route request. O(E). */
function buildAdjacency(graph: VenueGraph): Map<string, Adjacent[]> {
  const adj = new Map<string, Adjacent[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push({ edge, neighborId: edge.to });
    adj.get(edge.to)?.push({ edge, neighborId: edge.from });
  }
  return adj;
}

function euclidean(graph: VenueGraph, aId: string, bId: string): number {
  const a = getNode(graph, aId);
  const b = getNode(graph, bId);
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Map coordinates and real passage distances live on different scales (a short
 * flight of stairs spans a large vertical coordinate gap). A raw straight-line
 * heuristic would therefore OVER-estimate cost and make A* return sub-optimal
 * routes. We derive the smallest distance-per-coordinate-unit ratio across all
 * edges: multiplying the straight-line estimate by it guarantees the heuristic
 * is a lower bound on true travel distance (and hence on any profile cost,
 * since every profile cost >= distance). That keeps A* admissible → optimal.
 */
function admissibleScale(graph: VenueGraph): number {
  let scale = Number.POSITIVE_INFINITY;
  for (const edge of graph.edges) {
    const coordDist = euclidean(graph, edge.from, edge.to);
    if (coordDist <= 0) continue;
    scale = Math.min(scale, edge.distance / coordDist);
  }
  return Number.isFinite(scale) ? scale : 1;
}

function countClosuresAvoided(
  graph: VenueGraph,
  path: readonly string[],
  closures: Closures,
): number {
  if (closures.closedEdgeIds.size === 0) return 0;
  const onPath = new Set(path);
  let count = 0;
  for (const edge of graph.edges) {
    if (!closures.closedEdgeIds.has(edge.id)) continue;
    if (onPath.has(edge.from) || onPath.has(edge.to)) count++;
  }
  return count;
}

/**
 * Deterministic A* over the accessibility graph.
 *
 * - Heuristic = straight-line distance, which is admissible because every
 *   profile cost is >= physical distance, so the search returns an OPTIMAL
 *   (lowest-effort) route. This optimality is asserted in the tests.
 * - Closed nodes/edges and profile-`Infinity` costs are treated as impassable.
 * - Complexity: O(E log V) frontier operations.
 *
 * Returns a `found: false` result (never throws) when no accessible route
 * exists — the UI degrades to a clear "no step-free route" message.
 */
export function findRoute(
  graph: VenueGraph,
  startId: string,
  goalId: string,
  profile: AccessibilityProfile,
  closures: Closures = NO_CLOSURES,
): RouteResult {
  const start = getNode(graph, startId);
  const goal = getNode(graph, goalId);

  if (!start || !goal) {
    return emptyResult(`Unknown ${!start ? "start" : "destination"} location.`);
  }
  if (closures.closedNodeIds.has(startId) || closures.closedNodeIds.has(goalId)) {
    return emptyResult("Start or destination is currently closed.");
  }
  if (startId === goalId) {
    const label = start.label;
    return {
      found: true,
      path: [startId],
      totalDistanceMeters: 0,
      totalCost: 0,
      steps: [
        {
          nodeId: startId,
          label,
          instruction: `You are already at ${label}.`,
          distanceMeters: 0,
          move: { kind: "already", place: label, distance: 0 },
        },
      ],
      reason: "You are already there.",
      reasonInfo: { profileId: profile.id, via: [], closuresAvoided: 0 },
    };
  }

  const adj = buildAdjacency(graph);
  const scale = admissibleScale(graph);
  const heuristic = (id: string): number => euclidean(graph, id, goalId) * scale;

  const gScore = new Map<string, number>([[startId, 0]]);
  const cameFrom = new Map<string, { prev: string; edge: VenueEdge }>();

  const open = new MinHeap<{ id: string; f: number }>((n) => n.f);
  open.push({ id: startId, f: heuristic(startId) });

  // Lazy-deletion A*: the first time the goal is popped it is optimal because
  // the heuristic is admissible. A node may be popped again after its optimal
  // g is known; re-relaxing its neighbours then simply finds no improvement, so
  // no explicit "closed set" is needed.
  while (open.size > 0) {
    const current = open.pop()!;
    if (current.id === goalId) break;

    const currentG = gScore.get(current.id)!;
    for (const { edge, neighborId } of adj.get(current.id) ?? []) {
      if (closures.closedNodeIds.has(neighborId)) continue;
      if (closures.closedEdgeIds.has(edge.id)) continue;

      const stepCost = profile.edgeCost(edge);
      if (!Number.isFinite(stepCost)) continue; // impassable for this profile

      const tentativeG = currentG + stepCost;
      const knownG = gScore.get(neighborId);
      if (knownG === undefined || tentativeG < knownG) {
        gScore.set(neighborId, tentativeG);
        cameFrom.set(neighborId, { prev: current.id, edge });
        open.push({ id: neighborId, f: tentativeG + heuristic(neighborId) });
      }
    }
  }

  if (!gScore.has(goalId)) {
    return emptyResult(
      profile.id === "wheelchair"
        ? "No step-free route is available right now — please ask a steward for assistance."
        : "No accessible route is available right now.",
    );
  }

  // Reconstruct the path and the edges used.
  const path: string[] = [];
  const edgesUsed: VenueEdge[] = [];
  let cursor: string | undefined = goalId;
  while (cursor !== undefined) {
    path.unshift(cursor);
    const link = cameFrom.get(cursor);
    if (!link) break;
    edgesUsed.unshift(link.edge);
    cursor = link.prev;
  }

  const totalDistanceMeters = Math.round(edgesUsed.reduce((sum, e) => sum + e.distance, 0));
  const steps = generateInstructions(graph, path, edgesUsed);
  const closuresAvoided = countClosuresAvoided(graph, path, closures);
  const reason = describeRoute(profile, edgesUsed, closuresAvoided);
  const reasonInfo = routeReason(profile, edgesUsed, closuresAvoided);

  return {
    found: true,
    path,
    totalDistanceMeters,
    totalCost: gScore.get(goalId)!,
    steps,
    reason,
    reasonInfo,
  };
}

function emptyResult(reason: string): RouteResult {
  return { found: false, path: [], totalDistanceMeters: 0, totalCost: 0, steps: [], reason, reasonInfo: null };
}
