import { describe, expect, it } from "vitest";
import { DESTINATIONS, getNode, SAMPLE_VENUE } from "./venue";

describe("sample venue graph integrity", () => {
  const ids = new Set(SAMPLE_VENUE.nodes.map((n) => n.id));

  it("every edge connects two existing nodes with a positive distance", () => {
    for (const edge of SAMPLE_VENUE.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
      expect(edge.distance).toBeGreaterThan(0);
    }
  });

  it("has unique node ids and unique edge ids", () => {
    expect(ids.size).toBe(SAMPLE_VENUE.nodes.length);
    const edgeIds = new Set(SAMPLE_VENUE.edges.map((e) => e.id));
    expect(edgeIds.size).toBe(SAMPLE_VENUE.edges.length);
  });

  it("exposes destinations that all exist in the graph", () => {
    for (const d of DESTINATIONS) expect(ids.has(d)).toBe(true);
  });

  it("getNode resolves known ids and returns undefined otherwise", () => {
    expect(getNode(SAMPLE_VENUE, "restroom")?.label).toContain("Restroom");
    expect(getNode(SAMPLE_VENUE, "missing")).toBeUndefined();
  });
});
