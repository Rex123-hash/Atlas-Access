import { describe, expect, it } from "vitest";
import { LOCALES } from "./messages";
import type { RouteMoveKind } from "../routing/instructions";
import {
  factCategoryLabel,
  profileLabel,
  renderCrowdSummary,
  renderPlanIntro,
  renderPlanStepDetail,
  renderPlanStepTitle,
  renderRouteReason,
  renderRouteStep,
  type PlanStepKey,
} from "./templates";

const CODES = LOCALES.map((l) => l.code);
const STEP_KINDS: RouteMoveKind[] = ["start", "lift", "ramp", "stairs", "continue", "already"];
const PLAN_KEYS: PlanStepKey[] = ["setOff", "arrive", "bearings", "toSeat", "kickoff"];
const PROFILES = ["wheelchair", "blind", "sensory", "standard"] as const;
const CATEGORIES = ["restroom", "medical", "quiet", "bags", "gates"] as const;

/** No template should leave an unfilled {token} placeholder. */
function noPlaceholders(s: string) {
  expect(s).not.toMatch(/\{.*?\}/);
}

describe("dynamic localization is complete in every locale", () => {
  for (const loc of CODES) {
    it(`${loc}: renders every route step kind`, () => {
      for (const kind of STEP_KINDS) {
        const out = renderRouteStep({ kind, place: "West Concourse", distance: 42 }, loc);
        expect(out, `${loc}.${kind}`).toBeTruthy();
        noPlaceholders(out);
      }
    });

    it(`${loc}: renders the route reason for every profile`, () => {
      for (const profileId of PROFILES) {
        const out = renderRouteReason({ profileId, via: ["lift", "ramp"], closuresAvoided: 2 }, loc);
        expect(out).toBeTruthy();
        noPlaceholders(out);
      }
    });

    it(`${loc}: renders crowd summary (best + none)`, () => {
      const best = renderCrowdSummary({ zone: "West Entrance", pct: 31 }, loc);
      expect(best).toContain("31");
      noPlaceholders(best);
      expect(renderCrowdSummary(null, loc)).toBeTruthy();
    });

    it(`${loc}: renders every plan step + intro`, () => {
      for (const key of PLAN_KEYS) {
        expect(renderPlanStepTitle(key, loc)).toBeTruthy();
        expect(renderPlanStepDetail(key, true, loc)).toBeTruthy();
        expect(renderPlanStepDetail(key, false, loc)).toBeTruthy();
      }
      const intro = renderPlanIntro("Wheelchair", 120, loc);
      expect(intro).toContain("120");
      noPlaceholders(intro);
    });

    it(`${loc}: labels every profile and fact category`, () => {
      for (const p of PROFILES) expect(profileLabel(p, loc)).toBeTruthy();
      for (const c of CATEGORIES) expect(factCategoryLabel(c, loc)).toBeTruthy();
    });
  }
});

describe("route reason plural/singular closures", () => {
  it("uses distinct singular and plural closure phrasing (en)", () => {
    const one = renderRouteReason({ profileId: "standard", via: [], closuresAvoided: 1 }, "en");
    const many = renderRouteReason({ profileId: "standard", via: [], closuresAvoided: 2 }, "en");
    expect(one).toContain("1 closed passage");
    expect(one).not.toContain("passages");
    expect(many).toContain("2 closed passages");
  });
});
