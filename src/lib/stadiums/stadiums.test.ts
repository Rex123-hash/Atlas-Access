import { describe, expect, it } from "vitest";
import { findRoute } from "../routing/astar";
import { PROFILES, type ProfileId } from "../routing/profiles";
import { getStadium, STADIUMS } from "./index";

const PROFILE_IDS: ProfileId[] = ["standard", "wheelchair", "blind", "sensory"];

describe("stadium registry integrity", () => {
  for (const stadium of STADIUMS.filter((s) => s.available)) {
    it(`${stadium.id}: edges, destinations and entrance are valid`, () => {
      const ids = new Set(stadium.graph.nodes.map((n) => n.id));
      for (const edge of stadium.graph.edges) {
        expect(ids.has(edge.from)).toBe(true);
        expect(ids.has(edge.to)).toBe(true);
        expect(edge.distance).toBeGreaterThan(0);
      }
      expect(ids.has(stadium.entranceId)).toBe(true);
      for (const d of stadium.destinations) expect(ids.has(d)).toBe(true);
    });
  }

  it("getStadium resolves known ids and every shipped venue is available", () => {
    expect(getStadium("metlife")?.available).toBe(true);
    expect(getStadium("sofi")?.available).toBe(true);
    expect(getStadium("bcplace")?.available).toBe(true);
    expect(getStadium("nope")).toBeUndefined();
  });
});

describe("the four profiles produce genuinely different routes (per stadium)", () => {
  const cases = [
    { stadium: "metlife", to: "section_112", stairsNode: "stairs_w" },
    { stadium: "azteca", to: "az_cabecera", stairsNode: "az_escaleras" },
    { stadium: "sofi", to: "sf_section", stairsNode: "sf_stairs" },
    { stadium: "bcplace", to: "bc_section", stairsNode: "bc_stairs" },
  ];

  for (const c of cases) {
    it(`${c.stadium}: at least 3 distinct routes to ${c.to}`, () => {
      const stadium = getStadium(c.stadium)!;
      const paths = PROFILE_IDS.map((p) =>
        findRoute(stadium.graph, stadium.entranceId, c.to, PROFILES[p]).path.join(">"),
      );
      expect(new Set(paths).size).toBeGreaterThanOrEqual(3);
    });

    it(`${c.stadium}: wheelchair route never uses the stairs`, () => {
      const stadium = getStadium(c.stadium)!;
      const r = findRoute(stadium.graph, stadium.entranceId, c.to, PROFILES.wheelchair);
      expect(r.found).toBe(true);
      expect(r.path).not.toContain(c.stairsNode);
    });
  }
});
