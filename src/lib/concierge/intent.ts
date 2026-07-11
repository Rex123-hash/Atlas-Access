import type { ProfileId } from "../routing/profiles";
import type { Stadium } from "../stadiums";

/**
 * Deterministic, multilingual intent parser — the prompt-first "brain".
 *
 * It maps a free-text query (typed in any of our six languages) plus the
 * current stadium into a structured intent the app can act on. This runs
 * offline with no model, is fully unit-tested, and is what Gemini's parser
 * falls back to. Gemini improves recall; this guarantees correctness.
 */

export type Capability = "wayfinding" | "announce" | "crowd" | "planner";

export interface WayfindingParams {
  readonly profileId: ProfileId;
  readonly destinationId: string | null;
}

export interface Intent {
  readonly capability: Capability;
  readonly wayfinding: WayfindingParams;
}

const CROWD_WORDS = [
  "crowd", "busy", "queue", "line", "less crowded", "quickest gate", "best gate",
  "multitud", "fila", "menos gente", "foule", "porte", "ازدحام", "أفضل بوابة", "भीड़", "गेट",
  "lotação", "fila menor",
];

const PLANNER_WORDS = [
  "plan", "arrive", "arrival", "when should", "kick-off", "kickoff", "schedule", "itinerary",
  "llegar", "cuándo", "planear", "chegar", "quando", "arriver", "quand", "خطة", "متى أصل",
  "योजना", "कब पहुँच", "कब आऊँ",
];

const WAYFINDING_WORDS = [
  "route", "way", "navigate", "take me", "get to", "how do i get", "direction", "walk to",
  "ruta", "llévame", "cómo llego", "camino", "rota", "leve-me", "como chego",
  "itinéraire", "emmène", "comment aller", "مسار", "خذني", "كيف أصل",
  "रास्ता", "ले चलो", "कैसे पहुँच",
];

const WHEELCHAIR_WORDS = [
  "wheelchair", "step-free", "stepfree", "no stairs", "step free", "accessible",
  "silla de ruedas", "sin escaleras", "cadeira de rodas", "sem escadas",
  "fauteuil", "sans marches", "كرسي متحرك", "بدون درج", "व्हीलचेयर", "बिना सीढ़ी",
];
const BLIND_WORDS = [
  "blind", "low vision", "can't see", "cannot see", "visually impaired",
  "ciego", "cego", "aveugle", "أعمى", "ضعيف البصر", "नेत्रहीन", "देख नहीं",
];
const SENSORY_WORDS = [
  "sensory", "quiet", "calm", "autism", "autistic", "avoid crowd", "avoiding crowd", "less noise",
  "tranquilo", "sin ruido", "sensorial", "calme", "silencieux", "هدوء", "حسّي",
  "शांत", "कम शोर", "संवेदी",
];

const RESTROOM_WORDS = ["restroom", "toilet", "bathroom", "wc", "baño", "banheiro", "toilette", "حمام", "शौचालय"];
const MEDICAL_WORDS = ["medical", "first aid", "doctor", "médico", "medico", "secours", "طبي", "चिकित्सा", "मेडिकल"];
const QUIET_WORDS = ["quiet room", "sensory room", "sala sensorial", "salle sensorielle", "quiet", "sensorial", "शांत कक्ष"];

function has(query: string, words: readonly string[]): boolean {
  return words.some((w) => query.includes(w));
}

function detectProfile(query: string): ProfileId {
  if (has(query, WHEELCHAIR_WORDS)) return "wheelchair";
  if (has(query, BLIND_WORDS)) return "blind";
  if (has(query, SENSORY_WORDS)) return "sensory";
  return "standard";
}

/** Numbers mentioned in the query (e.g. "112"). */
function numbersIn(text: string): string[] {
  return text.match(/\d+/g) ?? [];
}

function detectDestination(query: string, stadium: Stadium): string | null {
  const nodeById = new Map(stadium.graph.nodes.map((n) => [n.id, n]));
  const queryNumbers = new Set(numbersIn(query));

  // 1. Match a section/seat number that appears in a destination's label.
  if (queryNumbers.size > 0) {
    for (const id of stadium.destinations) {
      const label = nodeById.get(id)?.label ?? "";
      if (numbersIn(label).some((n) => queryNumbers.has(n))) return id;
    }
  }

  // 2. Match by facility type keywords.
  const typeWanted: Record<string, boolean> = {
    restroom: has(query, RESTROOM_WORDS),
    medical: has(query, MEDICAL_WORDS),
    quiet_room: has(query, QUIET_WORDS),
  };
  for (const id of stadium.destinations) {
    const node = nodeById.get(id);
    if (node && typeWanted[node.type]) return id;
  }

  return null;
}

function classify(query: string, hasDestination: boolean): Capability {
  // A clear routing signal (an explicit "route/take me" verb, or a concrete
  // destination) wins first — so "route to 112 avoiding crowds" is wayfinding,
  // not a crowd query, even though it mentions crowds as a preference.
  if (has(query, WAYFINDING_WORDS) || hasDestination) return "wayfinding";
  if (has(query, CROWD_WORDS)) return "crowd";
  if (has(query, PLANNER_WORDS)) return "planner";
  return "announce";
}

export function parseIntent(rawQuery: string, stadium: Stadium): Intent {
  const query = rawQuery.toLowerCase().trim();
  const profileId = detectProfile(query);
  const destinationId = detectDestination(query, stadium);
  const capability = classify(query, destinationId !== null);
  return { capability, wayfinding: { profileId, destinationId } };
}
