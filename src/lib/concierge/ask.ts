import type { Stadium } from "../stadiums";
import type { Locale } from "../i18n/messages";
import { MESSAGES } from "../i18n/messages";
import { parseIntent } from "./intent";
import { answerQuestion } from "./qa";

/** Which dashboard tool an "Ask AtlasAccess" query should route the fan to. */
export type AskTool = "wayfinding" | "crowd" | "qa" | "planner";

export interface AskResult {
  /** A grounded, localized answer (also the fallback when Gemini is off). */
  readonly answer: string;
  /** The tool this request maps to, so the UI can offer a one-tap jump. */
  readonly tool: AskTool;
}

/**
 * Deterministic grounding for the "Ask AtlasAccess" front door. Classifies the
 * free-text query with the multilingual intent parser and returns a grounded,
 * localized answer plus the tool to open. Gemini rephrases this on the primary
 * path; this function is the always-available fallback and is fully testable.
 */
export function groundedAsk(query: string, stadium: Stadium, locale: Locale): AskResult {
  const intent = parseIntent(query, stadium);
  const dict = MESSAGES[locale] ?? MESSAGES.en;

  switch (intent.capability) {
    case "wayfinding":
      return { answer: dict.toolWayfindingDesc, tool: "wayfinding" };
    case "crowd":
      return { answer: dict.toolCrowdDesc, tool: "crowd" };
    case "planner":
      return { answer: dict.toolPlannerDesc, tool: "planner" };
    default:
      return { answer: answerQuestion(query, stadium, locale).answer, tool: "qa" };
  }
}

/** Compact grounding context passed to Gemini so its answer stays factual. */
export function venueContext(stadium: Stadium): string {
  const facts = stadium.facts.map((f) => f.answer.en).join(" ");
  const zones = [...stadium.zones]
    .sort((a, b) => a.density - b.density)
    .map((z) => `${z.label} ~${Math.round(z.density * 100)}% full`)
    .join(", ");
  return `Venue: ${stadium.name}, ${stadium.city}. ${facts} Current entry crowding: ${zones}.`;
}
