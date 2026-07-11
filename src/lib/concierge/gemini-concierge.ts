import { readGeminiSettings, type GeminiSettings } from "../gemini";
import type { Locale } from "../i18n";

/**
 * Generative-AI layer for the concierge. Two jobs, both with graceful fallback:
 *   1. localizeText — translate/rephrase a grounded English answer into the
 *      fan's language (Gemini does the multilingual heavy lifting).
 *   2. answerAppHelp — the in-app "Help AI" that answers doubts about how to use
 *      AtlasAccess, grounded in a fixed knowledge blurb.
 *
 * Neither ever throws: if Gemini is disabled/unauthenticated/failing, the app
 * still returns a useful answer. Auth is ADC on Vertex (no key in the repo).
 */

export interface AiText {
  readonly text: string;
  readonly source: "gemini" | "grounded";
}

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  ar: "Arabic",
  hi: "Hindi",
};

const APP_KNOWLEDGE =
  "AtlasAccess is an accessibility-first AI concierge for FIFA World Cup 2026 fans, " +
  "staff and volunteers. Fans type a request in any of six languages and it answers. " +
  "Capabilities: (1) Wayfinding — step-free, low-crowd or low-sensory routes to a seat, " +
  "restroom, medical point or quiet room, with a live map and spoken directions; " +
  "(2) Announcements & Q&A — grounded venue answers; (3) Crowd & Gates — the calmest " +
  "entry right now; (4) Matchday Planner — a personalised arrival timeline. Users pick " +
  "a stadium and language on the welcome screen and can change them anytime. It works " +
  "offline with a deterministic engine; Gemini adds language and phrasing.";

const HELP_FALLBACK =
  "AtlasAccess is your matchday concierge. Type what you need — for example a step-free " +
  "route to your seat, where the nearest accessible restroom is, which gate is calmest, " +
  "or when to arrive. You can change your stadium and language from the header at any time.";

export async function localizeText(
  text: string,
  locale: Locale,
  settings: GeminiSettings = readGeminiSettings(),
): Promise<AiText> {
  if (locale === "en" || !settings.useGemini) return { text, source: "grounded" };
  try {
    const translated = await callGemini(
      `Translate the following stadium guidance into ${LOCALE_NAMES[locale]}. ` +
        "Keep it concise, warm and reassuring. Output only the translation, no notes.",
      text,
      settings,
    );
    return { text: translated, source: "gemini" };
  } catch {
    return { text, source: "grounded" };
  }
}

export async function answerAppHelp(
  question: string,
  locale: Locale = "en",
  settings: GeminiSettings = readGeminiSettings(),
): Promise<AiText> {
  if (!settings.useGemini) return { text: HELP_FALLBACK, source: "grounded" };
  try {
    const answer = await callGemini(
      `You are the in-app help assistant for AtlasAccess. Answer the user's question about ` +
        `how to use the app in ${LOCALE_NAMES[locale]}, in 1-3 short sentences, using only ` +
        `this knowledge: ${APP_KNOWLEDGE}`,
      question,
      settings,
    );
    return { text: answer, source: "gemini" };
  } catch {
    return { text: HELP_FALLBACK, source: "grounded" };
  }
}

/**
 * The core "Ask AtlasAccess" answer. Gemini answers the fan's free-text question
 * grounded ONLY in the supplied venue context (facts + zones), in the fan's
 * language. This is GenAI on the primary path — deciding navigation and giving
 * real-time guidance — while the deterministic engine supplies the fallback and
 * the actual routing/execution. Returns { source: "grounded" } when Gemini is
 * unavailable so the caller can use its deterministic answer instead.
 */
export async function askStadium(
  query: string,
  venueContext: string,
  locale: Locale,
  settings: GeminiSettings = readGeminiSettings(),
): Promise<AiText> {
  if (!settings.useGemini) return { text: "", source: "grounded" };
  const answer = await callGemini(
    `You are AtlasAccess, a warm, practical accessibility concierge for FIFA World Cup 2026. ` +
      `Answer the fan's question in ${LOCALE_NAMES[locale]}, in 1-3 short sentences, grounded ONLY ` +
      `in this venue information (never invent facilities or figures): ${venueContext} ` +
      `If they want to get somewhere, tell them you're opening the step-free Wayfinding map for them.`,
    query,
    settings,
  );
  return { text: answer, source: "gemini" };
}

/** Lazy SDK import so local/CI paths need no credentials or package. */
async function callGemini(system: string, user: string, settings: GeminiSettings): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = settings.useVertex
    ? new GoogleGenAI({ vertexai: true, project: settings.project, location: settings.location })
    : new GoogleGenAI({ apiKey: settings.apiKey });

  const response = await ai.models.generateContent({
    model: settings.model,
    contents: user,
    config: { systemInstruction: system, temperature: 0.3, maxOutputTokens: 1024 },
  });
  const text = (response.text ?? "").trim();
  if (!text) throw new Error("Gemini returned no text");
  return text;
}
