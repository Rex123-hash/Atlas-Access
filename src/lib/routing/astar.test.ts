import { describe, expect, it } from "vitest";
import type { VenueGraph } from "../graph/types";
import { SAMPLE_VENUE } from "../graph/venue";
import { findRoute } from "./astar";
import { PROFILES } from "./profiles";

const G = SAMPLE_VENUE;

const FLAT = { stairs: false, ramp: false, lift: false, incline: 0, crowdProne: false, sensory: 0 };

describe("findRoute — robustness on malformed graphs", () => {
  it("tolerates zero-length and dangling edges without crashing", () => {
    // An edge to a non-existent node and a zero-coordinate-distance edge
    // exercise the defensive guards in the heuristic/scale computation.
    const graph: VenueGraph = {
      nodes: [
        { id: "A", label: "A", type: "concourse", x: 0, y: 0 },
        { id: "B", label: "B", type: "section", x: 10, y: 0 },
        { id: "C", label: "C", type: "concourse", x: 0, y: 0 },
      ],
      edges: [
        { id: "ab", from: "A", to: "B", distance: 10, features: FLAT },
        { id: "ac", from: "A", to: "C", distance: 4, features: FLAT }, // zero coord distance
        { id: "aphantom", from: "A", to: "phantom", distance: 5, features: FLAT }, // dangling
      ],
    };
    const r = findRoute(graph, "A", "B", PROFILES.standard);
    expect(r.found).toBe(true);
    expect(r.path).toEqual(["A", "B"]);
  });
});

describe("findRoute — basic behaviour", () => {
  it("finds the shortest standard route with the expected physical distance", () => {
    const r = findRoute(G, "transit", "section_130", PROFILES.standard);
    expect(r.found).toBe(true);
    expect(r.path).toEqual(["transit", "west_gate", "concourse_w", "concourse_e", "section_130"]);
    // 150 + 110 + 200 + 100 = 560 (cheaper than the 600 route via the restroom).
    expect(r.totalDistanceMeters).toBe(560);
  });

  it("returns a trivial route when start === goal", () => {
    const r = findRoute(G, "restroom", "restroom", PROFILES.wheelchair);
    expect(r.found).toBe(true);
    expect(r.path).toEqual(["restroom"]);
    expect(r.totalDistanceMeters).toBe(0);
    expect(r.steps[0]?.instruction).toContain("already at");
    expect(r.reason).toBe("You are already there.");
  });

  it("step count always equals node count", () => {
    const r = findRoute(G, "transit", "section_112", PROFILES.wheelchair);
    expect(r.steps).toHaveLength(r.path.length);
  });
});

describe("findRoute — invalid inputs degrade, never throw", () => {
  it("reports an unknown start", () => {
    const r = findRoute(G, "nope", "restroom", PROFILES.standard);
    expect(r.found).toBe(false);
    expect(r.reason).toContain("start");
  });

  it("reports an unknown destination", () => {
    const r = findRoute(G, "restroom", "nope", PROFILES.standard);
    expect(r.found).toBe(false);
    expect(r.reason).toContain("destination");
  });

  it("reports a closed start/destination node", () => {
    const closures = { closedEdgeIds: new Set<string>(), closedNodeIds: new Set(["restroom"]) };
    const r = findRoute(G, "restroom", "medical", PROFILES.standard, closures);
    expect(r.found).toBe(false);
    expect(r.reason).toContain("closed");
  });
});

describe("accessibility-aware routing — the core value", () => {
  it("standard routing uses the stairs (shortest) between concourse levels", () => {
    const r = findRoute(G, "concourse_w", "concourse_upper", PROFILES.standard);
    expect(r.found).toBe(true);
    expect(r.path).toContain("stairs_w");
  });

  it("wheelchair routing NEVER uses stairs and prefers the lift", () => {
    const r = findRoute(G, "west_gate", "concourse_upper", PROFILES.wheelchair);
    expect(r.found).toBe(true);
    expect(r.path).toContain("lift_w");
    expect(r.path).not.toContain("stairs_w");
    expect(r.reason).toContain("Step-free");
  });

  it("reroutes a wheelchair user around a closed lift onto the ramp", () => {
    const closures = { closedEdgeIds: new Set(["e_lift"]), closedNodeIds: new Set<string>() };
    const r = findRoute(G, "concourse_w", "concourse_upper", PROFILES.wheelchair, closures);
    expect(r.found).toBe(true);
    expect(r.path).toContain("ramp_w");
    expect(r.path).not.toContain("lift_w");
    expect(r.reason).toContain("rerouted around 1 closed passage");
  });

  it("skips a closed intermediate node but still completes the route", () => {
    const closures = { closedEdgeIds: new Set<string>(), closedNodeIds: new Set(["restroom"]) };
    const r = findRoute(G, "concourse_w", "section_130", PROFILES.standard, closures);
    expect(r.found).toBe(true);
    expect(r.path).not.toContain("restroom");
  });

  it("gives a generic (non-step-free) message when a standard route is fully blocked", () => {
    const closures = { closedEdgeIds: new Set(["e_gate_concourse"]), closedNodeIds: new Set<string>() };
    const r = findRoute(G, "transit", "section_130", PROFILES.standard, closures);
    expect(r.found).toBe(false);
    expect(r.reason).toContain("No accessible route");
  });

  it("returns a clear no-route result when every step-free option is closed", () => {
    const closures = {
      closedEdgeIds: new Set(["e_lift", "e_ramp"]),
      closedNodeIds: new Set<string>(),
    };
    const r = findRoute(G, "concourse_w", "concourse_upper", PROFILES.wheelchair, closures);
    expect(r.found).toBe(false);
    expect(r.reason).toContain("step-free");
  });

  it("sensory routing takes a longer, calmer path to avoid crowds", () => {
    const standard = findRoute(G, "concourse_w", "concourse_e", PROFILES.standard);
    const sensory = findRoute(G, "concourse_w", "concourse_e", PROFILES.sensory);
    // Standard goes direct (200 m); sensory detours via the calm restroom link.
    expect(standard.path).toEqual(["concourse_w", "concourse_e"]);
    expect(sensory.path).toContain("restroom");
    expect(sensory.totalDistanceMeters).toBeGreaterThan(standard.totalDistanceMeters);
    expect(sensory.reason).toContain("Low-sensory");
  });

  it("blind routing avoids crowd-prone passages", () => {
    const blind = findRoute(G, "concourse_w", "concourse_e", PROFILES.blind);
    expect(blind.path).toContain("restroom");
    expect(blind.reason).toContain("Calm");
  });
});

describe("instruction phrasing", () => {
  it("emits lift / ramp / continue phrasing and a start marker", () => {
    const r = findRoute(G, "west_gate", "concourse_upper", PROFILES.wheelchair);
    const text = r.steps.map((s) => s.instruction).join(" ");
    expect(r.steps[0]?.instruction).toContain("Start at");
    expect(text).toContain("Take the lift");
    expect(text).toContain("Continue");
  });

  it("emits stairs phrasing on a standard route that uses stairs", () => {
    const r = findRoute(G, "concourse_w", "concourse_upper", PROFILES.standard);
    const text = r.steps.map((s) => s.instruction).join(" ");
    expect(text).toContain("Take the stairs");
  });

  it("emits ramp phrasing when routed over a ramp", () => {
    const r = findRoute(G, "west_gate", "quiet", PROFILES.sensory);
    const text = r.steps.map((s) => s.instruction).join(" ");
    expect(text).toContain("Follow the ramp");
  });
});
