import type { FactCategory, Stadium } from "../stadiums";
import { MESSAGES, type Locale } from "../i18n/messages";

export interface QaResult {
  readonly answer: string;
  readonly matched: boolean;
  /** The topic that matched, when any — lets the UI highlight the quick list. */
  readonly category: FactCategory | null;
}

/**
 * Grounded question answering: matches the query against the selected stadium's
 * curated facts and returns the answer in the fan's language deterministically
 * (no AI). Falls back to a safe "ask a steward" message when nothing matches.
 */
export function answerQuestion(query: string, stadium: Stadium, locale: Locale = "en"): QaResult {
  const q = query.toLowerCase();
  for (const fact of stadium.facts) {
    if (fact.keywords.some((k) => q.includes(k))) {
      return {
        answer: fact.answer[locale] ?? fact.answer.en,
        matched: true,
        category: fact.category,
      };
    }
  }
  return {
    answer: MESSAGES[locale]?.qaFallback ?? MESSAGES.en.qaFallback,
    matched: false,
    category: null,
  };
}
