import { describe, expect, it } from "vitest";
import { getStadium } from "../stadiums";
import { groundedAsk, venueContext } from "./ask";

const metlife = getStadium("metlife")!;

describe("groundedAsk", () => {
  it("routes a navigation request to the wayfinding tool", () => {
    expect(groundedAsk("step-free route to Section 112", metlife, "en").tool).toBe("wayfinding");
  });

  it("routes a crowd request to the crowd tool", () => {
    expect(groundedAsk("which gate is least crowded?", metlife, "en").tool).toBe("crowd");
  });

  it("routes a planning request to the planner tool", () => {
    expect(groundedAsk("when should I arrive before kick-off?", metlife, "en").tool).toBe("planner");
  });

  it("answers a non-navigational venue question in the fan's language via Q&A", () => {
    const r = groundedAsk("¿qué bolsas están permitidas?", metlife, "es");
    expect(r.tool).toBe("qa");
    expect(r.answer.toLowerCase()).toContain("bolsas");
  });

  it("routes 'where is the restroom' to wayfinding (offers to take you there)", () => {
    expect(groundedAsk("where is the accessible restroom?", metlife, "en").tool).toBe("wayfinding");
  });
});

describe("venueContext", () => {
  it("includes venue name, facts and crowd zones for grounding", () => {
    const ctx = venueContext(metlife);
    expect(ctx).toContain("MetLife Stadium");
    expect(ctx).toContain("%");
  });
});
