import { describe, expect, it } from "vitest";
import { SAMPLE_VENUE } from "./graph/venue";
import { interpretObstacleWithRules } from "./rules-fallback";

describe("interpretObstacleWithRules", () => {
  it("closes the lift passage when a node has a lift", () => {
    const r = interpretObstacleWithRules(SAMPLE_VENUE, "concourse_w");
    expect(r.obstacleType).toBe("lift_out_of_service");
    expect(r.closedEdgeHint).toBe("e_lift");
    expect(r.severity).toBe("medium");
    expect(r.source).toBe("rules");
  });

  it("closes the first incident passage for a blockage with no lift", () => {
    const r = interpretObstacleWithRules(SAMPLE_VENUE, "restroom");
    expect(r.obstacleType).toBe("path_blocked");
    expect(r.closedEdgeHint).not.toBeNull();
  });

  it("returns no hint for an unknown node", () => {
    const r = interpretObstacleWithRules(SAMPLE_VENUE, "ghost");
    expect(r.obstacleType).toBe("unidentified");
    expect(r.closedEdgeHint).toBeNull();
    expect(r.severity).toBe("low");
  });
});
