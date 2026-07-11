import { describe, expect, it } from "vitest";
import { getStadium } from "../stadiums";
import { parseIntent } from "./intent";

const metlife = getStadium("metlife")!;
const azteca = getStadium("azteca")!;

describe("parseIntent — capability classification", () => {
  it("routes a wayfinding request with a wheelchair profile and section number", () => {
    const i = parseIntent("step-free route to Section 112 avoiding crowds", metlife);
    expect(i.capability).toBe("wayfinding");
    expect(i.wayfinding.profileId).toBe("wheelchair");
    expect(i.wayfinding.destinationId).toBe("section_112");
  });

  it("classifies a Spanish wheelchair request", () => {
    const i = parseIntent("llévame en silla de ruedas a la sección 112", metlife);
    expect(i.capability).toBe("wayfinding");
    expect(i.wayfinding.profileId).toBe("wheelchair");
    expect(i.wayfinding.destinationId).toBe("section_112");
  });

  it("treats a 'where is' question as Q&A / announcements", () => {
    const i = parseIntent("where is the nearest restroom?", metlife);
    expect(i.capability).toBe("wayfinding"); // a destination is detected → routeable
    expect(i.wayfinding.destinationId).toBe("restroom");
  });

  it("classifies a crowd question", () => {
    const i = parseIntent("which gate is less crowded right now?", metlife);
    expect(i.capability).toBe("crowd");
  });

  it("classifies a planner question", () => {
    const i = parseIntent("when should I arrive before kick-off?", metlife);
    expect(i.capability).toBe("planner");
  });

  it("falls back to announcements/Q&A for a general question", () => {
    const i = parseIntent("what bags are allowed inside?", metlife);
    expect(i.capability).toBe("announce");
    expect(i.wayfinding.destinationId).toBeNull();
  });
});

describe("parseIntent — profile & destination detection", () => {
  it("detects blind and sensory profiles", () => {
    expect(parseIntent("I am blind, guide me to my seat", metlife).wayfinding.profileId).toBe("blind");
    expect(parseIntent("take me somewhere calm, avoid crowds", metlife).wayfinding.profileId).toBe("sensory");
  });

  it("detects the quiet room and medical point by keyword", () => {
    expect(parseIntent("route to the quiet room", metlife).wayfinding.destinationId).toBe("quiet");
    expect(parseIntent("get me to the medical point", metlife).wayfinding.destinationId).toBe("medical");
  });

  it("resolves destinations against the selected stadium's own graph", () => {
    const i = parseIntent("ruta a general 105", azteca);
    expect(i.wayfinding.destinationId).toBe("az_general");
  });

  it("returns standard profile and no destination for an unmatched query", () => {
    const i = parseIntent("hello there", metlife);
    expect(i.wayfinding.profileId).toBe("standard");
    expect(i.wayfinding.destinationId).toBeNull();
  });
});
