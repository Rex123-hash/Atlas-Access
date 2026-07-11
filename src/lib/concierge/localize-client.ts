import type { Locale } from "../i18n";

export interface Localized {
  readonly text: string;
  readonly ai: boolean;
}

/**
 * Client helper that asks the /api/concierge endpoint to translate/rephrase a
 * grounded English answer via Gemini. Called from event handlers (never from an
 * effect), and falls back to the original text on any failure or for English.
 */
export async function localizeClient(text: string, locale: Locale): Promise<Localized> {
  if (locale === "en") return { text, ai: false };
  try {
    const res = await fetch("/api/concierge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, locale }),
    });
    if (!res.ok) return { text, ai: false };
    const data = (await res.json()) as { text: string; source: "grounded" | "gemini" };
    return { text: data.text, ai: data.source === "gemini" };
  } catch {
    return { text, ai: false };
  }
}
