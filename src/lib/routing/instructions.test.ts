import { describe, expect, it } from "vitest";
import type { EdgeFeatures, VenueEdge } from "../graph/types";
import { SAMPLE_VENUE } from "../graph/venue";
import { describeRoute, generateInstructions } from "./instructions";
import { PROFILES } from "./profiles";

function edge(features: Partial<EdgeFeatures>): VenueEdge {
  return {
    id: "t",
    from: "a",
    to: "b",
    distance: 10,
    features: {
      stairs: false,
      ramp: false,
      lift: false,
      incline: 0,
      crowdProne: false,
      sensory: 0,
      ...features,
    },
  };
}

describe("generateInstructions", () => {
  it("returns an empty list for an empty path", () => {
    expect(generateInstructions(SAMPLE_VENUE, [], [])).toEqual([]);
  });

  it("falls back to the raw id when the start node is unknown", () => {
    const steps = generateInstructions(SAMPLE_VENUE, ["ghost"], []);
    expect(steps[0]?.label).toBe("ghost");
    expect(steps[0]?.instruction).toBe("Start at ghost.");
  });

  it("falls back to the raw id for an unknown intermediate node", () => {
    const steps = generateInstructions(SAMPLE_VENUE, ["restroom", "ghost"], [edge({})]);
    expect(steps[1]?.label).toBe("ghost");
    expect(steps[1]?.instruction).toContain("ghost");
  });
});

describe("describeRoute", () => {
  it("summarises a step-free route via lift and ramp and reports closures (plural)", () => {
    const reason = describeRoute(PROFILES.wheelchair, [edge({ lift: true }), edge({ ramp: true })], 2);
    expect(reason).toContain("Step-free route");
    expect(reason).toContain("via lift and ramp");
    expect(reason).toContain("rerouted around 2 closed passages");
  });

  it("uses singular phrasing for a single closure", () => {
    const reason = describeRoute(PROFILES.standard, [edge({ stairs: true })], 1);
    expect(reason).toContain("Shortest route");
    expect(reason).toContain("via stairs");
    expect(reason).toContain("rerouted around 1 closed passage");
    expect(reason).not.toContain("passages");
  });

  it("labels the blind and sensory profiles distinctly with no closures", () => {
    expect(describeRoute(PROFILES.blind, [edge({})], 0)).toContain("Calm, low-crowd route");
    expect(describeRoute(PROFILES.sensory, [edge({})], 0)).toContain("Low-sensory route");
  });
});
