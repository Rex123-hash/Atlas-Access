import { describe, expect, it } from "vitest";
import { getStadium } from "../stadiums";
import { answerQuestion } from "./qa";
import { recommendEntry } from "./crowd";
import { buildPlan } from "./planner";

const metlife = getStadium("metlife")!;

describe("answerQuestion", () => {
  it("returns a grounded fact when keywords match", () => {
    const r = answerQuestion("where is the nearest toilet?", metlife);
    expect(r.matched).toBe(true);
    expect(r.answer.toLowerCase()).toContain("restroom");
  });

  it("returns a safe fallback when nothing matches", () => {
    const r = answerQuestion("what is the offside rule", metlife);
    expect(r.matched).toBe(false);
    expect(r.answer).toContain("steward");
  });
});

describe("recommendEntry", () => {
  it("ranks zones least-crowded first and picks the calmest", () => {
    const r = recommendEntry(metlife);
    expect(r.zones[0]!.density).toBeLessThanOrEqual(r.zones[r.zones.length - 1]!.density);
    expect(r.bestZoneId).toBe(r.zones[0]!.id);
    expect(r.summary).toContain("%");
  });

  it("handles a stadium with no zones", () => {
    const empty = { ...metlife, zones: [] };
    const r = recommendEntry(empty);
    expect(r.bestZoneId).toBeNull();
    expect(r.summary).toContain("No live crowd data");
  });
});

describe("buildPlan", () => {
  it("advises accessible fans to arrive earlier than standard fans", () => {
    expect(buildPlan("wheelchair").arriveMinutesEarly).toBe(120);
    expect(buildPlan("standard").arriveMinutesEarly).toBe(75);
  });

  it("produces a timeline ending at kick-off", () => {
    const plan = buildPlan("sensory");
    expect(plan.steps.length).toBeGreaterThan(3);
    expect(plan.steps[plan.steps.length - 1]!.offsetMin).toBe(0);
  });
});
