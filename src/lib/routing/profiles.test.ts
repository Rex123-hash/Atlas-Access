import { describe, expect, it } from "vitest";
import type { EdgeFeatures, VenueEdge } from "../graph/types";
import { getProfile, PROFILES } from "./profiles";

function edge(distance: number, features: Partial<EdgeFeatures>): VenueEdge {
  return {
    id: "t",
    from: "a",
    to: "b",
    distance,
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

describe("accessibility profile cost functions", () => {
  it("standard cost is pure physical distance", () => {
    expect(PROFILES.standard.edgeCost(edge(100, {}))).toBe(100);
  });

  it("wheelchair marks stairs impassable", () => {
    expect(PROFILES.wheelchair.edgeCost(edge(10, { stairs: true }))).toBe(Number.POSITIVE_INFINITY);
  });

  it("wheelchair penalises incline", () => {
    // 100 * (1 + 0.05 * 6) = 130
    expect(PROFILES.wheelchair.edgeCost(edge(100, { incline: 0.05 }))).toBeCloseTo(130);
  });

  it("blind heavily penalises crowd-prone passages", () => {
    expect(PROFILES.blind.edgeCost(edge(100, { crowdProne: true }))).toBeCloseTo(260);
    expect(PROFILES.blind.edgeCost(edge(100, {}))).toBe(100);
  });

  it("blind applies a small caution penalty on stairs", () => {
    expect(PROFILES.blind.edgeCost(edge(100, { stairs: true }))).toBeCloseTo(140);
  });

  it("sensory penalises noise/light and crowding", () => {
    // 100 * (1 + 0.8*4) * 2.2 = 924
    expect(PROFILES.sensory.edgeCost(edge(100, { sensory: 0.8, crowdProne: true }))).toBeCloseTo(924);
  });

  it("getProfile returns the requested profile", () => {
    expect(getProfile("blind").id).toBe("blind");
    expect(getProfile("standard").label).toBe("Standard");
  });
});
