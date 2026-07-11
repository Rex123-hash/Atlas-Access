import type { VenueGraph } from "./graph/types";
import type { ObstacleInterpretation } from "./schemas";

/**
 * Deterministic obstacle interpretation. Always available, never throws — this
 * is what runs when Gemini is disabled, unauthenticated, rate-limited or errors.
 *
 * Crucially, even when Gemini IS used, the *graph action* (which passage to
 * close) is decided here, not by the model: perception is probabilistic, but
 * closing a passage for a blind or wheelchair user is safety-critical and must
 * be deterministic and testable.
 */
export function interpretObstacleWithRules(
  graph: VenueGraph,
  nearNodeId: string,
): ObstacleInterpretation {
  const incident = graph.edges.filter((e) => e.from === nearNodeId || e.to === nearNodeId);

  // A lift outage is the most common and highest-impact failure, so prefer to
  // close a lift passage here; otherwise close the first incident passage.
  const liftEdge = incident.find((e) => e.features.lift);
  const target = liftEdge ?? incident[0];

  if (!target) {
    return {
      obstacleType: "unidentified",
      severity: "low",
      closedEdgeHint: null,
      guidance:
        "I couldn't identify a passage to reroute here. Please ask a nearby steward for assistance.",
      source: "rules",
    };
  }

  if (liftEdge) {
    return {
      obstacleType: "lift_out_of_service",
      severity: "medium",
      closedEdgeHint: liftEdge.id,
      guidance: "This lift appears to be out of service — I'll find you a step-free alternative.",
      source: "rules",
    };
  }

  return {
    obstacleType: "path_blocked",
    severity: "medium",
    closedEdgeHint: target.id,
    guidance: "This passage appears blocked — I'll route you around it.",
    source: "rules",
  };
}
