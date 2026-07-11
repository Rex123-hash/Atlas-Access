/**
 * Deterministic localization for DYNAMIC engine output — route steps, the route
 * "why" summary, crowd recommendation and the matchday plan. The engines emit
 * structured descriptors (a kind + numeric/proper-noun params); this module
 * turns them into a native sentence per locale. No AI is involved: switching
 * language re-renders instantly and works fully offline.
 *
 * Place names (node/zone labels) are proper nouns and stay in their original
 * form, exactly as a real venue would sign them.
 */

import { MESSAGES, type Locale, type MessageKey } from "./messages";
import type { ProfileId } from "../routing/profiles";
import type { RouteMove, RouteMoveKind } from "../routing/instructions";

const PROFILE_KEY: Record<ProfileId, MessageKey> = {
  wheelchair: "profileWheelchair",
  blind: "profileBlind",
  sensory: "profileSensory",
  standard: "profileStandard",
};

/** Localized display label for an accessibility profile. */
export function profileLabel(id: ProfileId, locale: Locale): string {
  const key = PROFILE_KEY[id];
  return MESSAGES[locale]?.[key] ?? MESSAGES.en[key];
}

type Params = Record<string, string | number>;

/** Interpolate `{token}` placeholders. Unknown tokens render empty. */
function fill(template: string, params: Params): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""));
}

// --- Route steps -----------------------------------------------------------

const ROUTE_STEP: Record<Locale, Record<RouteMoveKind, string>> = {
  en: {
    start: "Start at {place}.",
    lift: "Take the lift to {place} ({d} m).",
    ramp: "Follow the ramp to {place} ({d} m).",
    stairs: "Take the stairs to {place} ({d} m).",
    continue: "Continue {d} m to {place}.",
    already: "You are already at {place}.",
  },
  es: {
    start: "Comienza en {place}.",
    lift: "Toma el ascensor hasta {place} ({d} m).",
    ramp: "Sigue la rampa hasta {place} ({d} m).",
    stairs: "Toma las escaleras hasta {place} ({d} m).",
    continue: "Continúa {d} m hasta {place}.",
    already: "Ya estás en {place}.",
  },
  pt: {
    start: "Comece em {place}.",
    lift: "Apanhe o elevador até {place} ({d} m).",
    ramp: "Siga a rampa até {place} ({d} m).",
    stairs: "Suba as escadas até {place} ({d} m).",
    continue: "Continue {d} m até {place}.",
    already: "Já está em {place}.",
  },
  fr: {
    start: "Commencez à {place}.",
    lift: "Prenez l'ascenseur jusqu'à {place} ({d} m).",
    ramp: "Suivez la rampe jusqu'à {place} ({d} m).",
    stairs: "Prenez les escaliers jusqu'à {place} ({d} m).",
    continue: "Continuez {d} m jusqu'à {place}.",
    already: "Vous êtes déjà à {place}.",
  },
  ar: {
    start: "ابدأ من {place}.",
    lift: "استقل المصعد إلى {place} ({d} م).",
    ramp: "اتبع المنحدر إلى {place} ({d} م).",
    stairs: "اصعد الدرج إلى {place} ({d} م).",
    continue: "تابع {d} م إلى {place}.",
    already: "أنت بالفعل عند {place}.",
  },
  hi: {
    start: "{place} से शुरू करें।",
    lift: "{place} तक लिफ्ट लें ({d} मी)।",
    ramp: "{place} तक रैंप का अनुसरण करें ({d} मी)।",
    stairs: "{place} तक सीढ़ियाँ लें ({d} मी)।",
    continue: "{place} तक {d} मी आगे बढ़ें।",
    already: "आप पहले से ही {place} पर हैं।",
  },
};

export function renderRouteStep(move: RouteMove, locale: Locale): string {
  const table = ROUTE_STEP[locale] ?? ROUTE_STEP.en;
  return fill(table[move.kind] ?? ROUTE_STEP.en[move.kind], { place: move.place, d: move.distance });
}

// --- Route reason ("why this route") --------------------------------------

export type Vertical = "lift" | "ramp" | "stairs";

export interface RouteReason {
  readonly profileId: ProfileId;
  readonly via: readonly Vertical[];
  readonly closuresAvoided: number;
}

const REASON_PREFIX: Record<Locale, Record<ProfileId, string>> = {
  en: { wheelchair: "Step-free route", blind: "Calm, low-crowd route", sensory: "Low-sensory route", standard: "Shortest route" },
  es: { wheelchair: "Ruta sin escalones", blind: "Ruta tranquila y poco concurrida", sensory: "Ruta de bajo impacto sensorial", standard: "Ruta más corta" },
  pt: { wheelchair: "Rota sem degraus", blind: "Rota calma e pouco movimentada", sensory: "Rota de baixo estímulo sensorial", standard: "Rota mais curta" },
  fr: { wheelchair: "Itinéraire sans marches", blind: "Itinéraire calme et peu fréquenté", sensory: "Itinéraire à faible stimulation sensorielle", standard: "Itinéraire le plus court" },
  ar: { wheelchair: "مسار بدون درج", blind: "مسار هادئ وقليل الازدحام", sensory: "مسار منخفض الإثارة الحسية", standard: "أقصر مسار" },
  hi: { wheelchair: "सीढ़ी-रहित मार्ग", blind: "शांत, कम-भीड़ मार्ग", sensory: "कम-संवेदी मार्ग", standard: "सबसे छोटा मार्ग" },
};

const VERTICAL_WORD: Record<Locale, Record<Vertical, string>> = {
  en: { lift: "lift", ramp: "ramp", stairs: "stairs" },
  es: { lift: "ascensor", ramp: "rampa", stairs: "escaleras" },
  pt: { lift: "elevador", ramp: "rampa", stairs: "escadas" },
  fr: { lift: "ascenseur", ramp: "rampe", stairs: "escaliers" },
  ar: { lift: "المصعد", ramp: "المنحدر", stairs: "الدرج" },
  hi: { lift: "लिफ्ट", ramp: "रैंप", stairs: "सीढ़ियाँ" },
};

const AND: Record<Locale, string> = { en: "and", es: "y", pt: "e", fr: "et", ar: "و", hi: "और" };
const VIA: Record<Locale, string> = { en: "via {list}", es: "vía {list}", pt: "via {list}", fr: "via {list}", ar: "عبر {list}", hi: "{list} के माध्यम से" };

const CLOSURES: Record<Locale, { one: string; many: string }> = {
  en: { one: "rerouted around {n} closed passage", many: "rerouted around {n} closed passages" },
  es: { one: "se evitó {n} pasaje cerrado", many: "se evitaron {n} pasajes cerrados" },
  pt: { one: "contornou {n} passagem fechada", many: "contornou {n} passagens fechadas" },
  fr: { one: "contourne {n} passage fermé", many: "contourne {n} passages fermés" },
  ar: { one: "مع تفادي {n} ممر مغلق", many: "مع تفادي {n} ممرات مغلقة" },
  hi: { one: "{n} बंद रास्ते से बचते हुए", many: "{n} बंद रास्तों से बचते हुए" },
};

export function renderRouteReason(reason: RouteReason, locale: Locale): string {
  const loc = REASON_PREFIX[locale] ? locale : "en";
  const parts: string[] = [REASON_PREFIX[loc][reason.profileId]];

  if (reason.via.length > 0) {
    const words = reason.via.map((v) => VERTICAL_WORD[loc][v]);
    const list = words.length > 1 ? `${words.slice(0, -1).join(", ")} ${AND[loc]} ${words[words.length - 1]}` : words[0]!;
    parts.push(fill(VIA[loc], { list }));
  }

  if (reason.closuresAvoided > 0) {
    const tpl = reason.closuresAvoided === 1 ? CLOSURES[loc].one : CLOSURES[loc].many;
    parts.push(fill(tpl, { n: reason.closuresAvoided }));
  }

  return `${parts.join(", ")}.`;
}

// --- Crowd -----------------------------------------------------------------

const CROWD_BEST: Record<Locale, string> = {
  en: "{zone} is the calmest entry right now (about {pct}% full). Heading there will save you time and crowding.",
  es: "{zone} es la entrada más tranquila ahora mismo (alrededor del {pct}% de ocupación). Ir allí te ahorrará tiempo y aglomeraciones.",
  pt: "{zone} é a entrada mais calma neste momento (cerca de {pct}% de ocupação). Ir para lá poupa-te tempo e multidões.",
  fr: "{zone} est l'entrée la plus calme en ce moment (environ {pct}% de remplissage). Vous y gagnerez du temps et éviterez la foule.",
  ar: "{zone} هو المدخل الأهدأ الآن (نحو {pct}% ممتلئ). التوجّه إليه يوفّر عليك الوقت والزحام.",
  hi: "{zone} अभी सबसे शांत प्रवेश है (लगभग {pct}% भरा)। वहाँ जाने से समय और भीड़ दोनों बचेंगे।",
};

const CROWD_NONE: Record<Locale, string> = {
  en: "No live crowd data is available for this stadium yet.",
  es: "Aún no hay datos de afluencia en vivo para este estadio.",
  pt: "Ainda não há dados de multidão ao vivo para este estádio.",
  fr: "Aucune donnée d'affluence en direct n'est disponible pour ce stade.",
  ar: "لا تتوفر بيانات ازدحام مباشرة لهذا الملعب بعد.",
  hi: "इस स्टेडियम के लिए अभी लाइव भीड़ डेटा उपलब्ध नहीं है।",
};

export function renderCrowdSummary(best: { zone: string; pct: number } | null, locale: Locale): string {
  const loc = CROWD_BEST[locale] ? locale : "en";
  if (!best) return CROWD_NONE[loc];
  return fill(CROWD_BEST[loc], { zone: best.zone, pct: best.pct });
}

// --- Matchday planner ------------------------------------------------------

export type PlanStepKey = "setOff" | "arrive" | "bearings" | "toSeat" | "kickoff";

interface PlanCopy {
  readonly title: string;
  readonly detail: string;
  readonly detailExtra?: string;
}

const PLAN: Record<Locale, Record<PlanStepKey, PlanCopy>> = {
  en: {
    setOff: { title: "Set off for the stadium", detail: "Leave early to beat the queues at security.", detailExtra: "Allow extra time for step-free transit and priority security lanes." },
    arrive: { title: "Arrive at your accessible entrance", detail: "Use the step-free entrance and the priority lane for disabled fans." },
    bearings: { title: "Get your bearings", detail: "Grab refreshments before the concourse fills up.", detailExtra: "Locate the nearest accessible restroom and the quiet room before the crowds build." },
    toSeat: { title: "Head to your seat", detail: "Give yourself around 15 minutes to reach your section calmly." },
    kickoff: { title: "Kick-off", detail: "Enjoy the match." },
  },
  es: {
    setOff: { title: "Ponte en camino al estadio", detail: "Sal con tiempo para evitar las colas de seguridad.", detailExtra: "Deja tiempo extra para el transporte sin escalones y los carriles prioritarios de seguridad." },
    arrive: { title: "Llega a tu entrada accesible", detail: "Usa la entrada sin escalones y el carril prioritario para aficionados con discapacidad." },
    bearings: { title: "Ubícate", detail: "Toma algo antes de que se llene el pasillo.", detailExtra: "Localiza el baño accesible más cercano y la sala tranquila antes de que llegue la multitud." },
    toSeat: { title: "Ve a tu asiento", detail: "Date unos 15 minutos para llegar con calma a tu sección." },
    kickoff: { title: "Inicio", detail: "Disfruta del partido." },
  },
  pt: {
    setOff: { title: "Parta para o estádio", detail: "Saia cedo para evitar as filas na segurança.", detailExtra: "Reserve tempo extra para o transporte sem degraus e as vias prioritárias de segurança." },
    arrive: { title: "Chegue à sua entrada acessível", detail: "Use a entrada sem degraus e a via prioritária para adeptos com deficiência." },
    bearings: { title: "Oriente-se", detail: "Compre algo antes de o corredor encher.", detailExtra: "Localize a casa de banho acessível mais próxima e a sala tranquila antes de a multidão chegar." },
    toSeat: { title: "Vá para o seu lugar", detail: "Reserve cerca de 15 minutos para chegar com calma à sua secção." },
    kickoff: { title: "Início", detail: "Aproveite o jogo." },
  },
  fr: {
    setOff: { title: "Partez vers le stade", detail: "Partez tôt pour éviter les files à la sécurité.", detailExtra: "Prévoyez du temps supplémentaire pour le transport sans marches et les files prioritaires." },
    arrive: { title: "Arrivez à votre entrée accessible", detail: "Utilisez l'entrée sans marches et la file prioritaire pour les supporters handicapés." },
    bearings: { title: "Repérez-vous", detail: "Prenez une collation avant que le hall ne se remplisse.", detailExtra: "Repérez les toilettes accessibles les plus proches et la salle calme avant l'arrivée de la foule." },
    toSeat: { title: "Rejoignez votre place", detail: "Prévoyez environ 15 minutes pour rejoindre calmement votre section." },
    kickoff: { title: "Coup d'envoi", detail: "Profitez du match." },
  },
  ar: {
    setOff: { title: "انطلق إلى الملعب", detail: "اخرج مبكرًا لتجنّب طوابير التفتيش.", detailExtra: "خصّص وقتًا إضافيًا للتنقّل بدون درج ولمسارات التفتيش ذات الأولوية." },
    arrive: { title: "اصل إلى مدخلك الميسّر", detail: "استخدم المدخل بدون درج والمسار المخصّص للمشجعين ذوي الإعاقة." },
    bearings: { title: "حدّد موقعك", detail: "احصل على مرطبات قبل أن يمتلئ الممر.", detailExtra: "حدّد أقرب دورة مياه متاحة والغرفة الهادئة قبل ازدحام الحشود." },
    toSeat: { title: "توجّه إلى مقعدك", detail: "امنح نفسك نحو 15 دقيقة للوصول إلى قسمك بهدوء." },
    kickoff: { title: "انطلاق المباراة", detail: "استمتع بالمباراة." },
  },
  hi: {
    setOff: { title: "स्टेडियम के लिए निकलें", detail: "सुरक्षा कतारों से बचने के लिए जल्दी निकलें।", detailExtra: "सीढ़ी-रहित यात्रा और प्राथमिकता सुरक्षा लेन के लिए अतिरिक्त समय रखें।" },
    arrive: { title: "अपने सुलभ प्रवेश पर पहुँचें", detail: "सीढ़ी-रहित प्रवेश और दिव्यांग प्रशंसकों के लिए प्राथमिकता लेन का उपयोग करें।" },
    bearings: { title: "अपना स्थान पहचानें", detail: "गलियारा भरने से पहले जलपान ले लें।", detailExtra: "भीड़ बढ़ने से पहले निकटतम सुलभ शौचालय और शांत कक्ष खोज लें।" },
    toSeat: { title: "अपनी सीट पर जाएँ", detail: "अपने सेक्शन तक शांति से पहुँचने के लिए लगभग 15 मिनट रखें।" },
    kickoff: { title: "किक-ऑफ", detail: "मैच का आनंद लें।" },
  },
};

const PLAN_INTRO: Record<Locale, string> = {
  en: "Based on your profile ({profile}), arrive about {min} minutes before kick-off. Here is your matchday timeline.",
  es: "Según tu perfil ({profile}), llega unos {min} minutos antes del inicio. Aquí tienes tu cronograma del partido.",
  pt: "Com base no teu perfil ({profile}), chega cerca de {min} minutos antes do início. Aqui está a tua agenda do jogo.",
  fr: "Selon votre profil ({profile}), arrivez environ {min} minutes avant le coup d'envoi. Voici votre programme du match.",
  ar: "بناءً على ملفك ({profile})، احضر قبل انطلاق المباراة بنحو {min} دقيقة. إليك جدول يوم المباراة.",
  hi: "आपकी प्रोफ़ाइल ({profile}) के अनुसार, किक-ऑफ से लगभग {min} मिनट पहले पहुँचें। यह रही आपकी मैचडे समय-सारिणी।",
};

export function renderPlanStepTitle(key: PlanStepKey, locale: Locale): string {
  return (PLAN[locale] ?? PLAN.en)[key].title;
}

export function renderPlanStepDetail(key: PlanStepKey, needsExtraTime: boolean, locale: Locale): string {
  const copy = (PLAN[locale] ?? PLAN.en)[key];
  return needsExtraTime && copy.detailExtra ? copy.detailExtra : copy.detail;
}

export function renderPlanIntro(profileLabel: string, minutes: number, locale: Locale): string {
  const loc = PLAN_INTRO[locale] ? locale : "en";
  return fill(PLAN_INTRO[loc], { profile: profileLabel, min: minutes });
}

// --- Q&A category labels (for the quick-question list) ---------------------

type FactCategory = "restroom" | "medical" | "quiet" | "bags" | "gates";

const FACT_LABEL: Record<Locale, Record<FactCategory, string>> = {
  en: { restroom: "Accessible restroom", medical: "Medical point", quiet: "Quiet / sensory room", bags: "Bags & security", gates: "Gates & entry" },
  es: { restroom: "Baño accesible", medical: "Punto médico", quiet: "Sala tranquila / sensorial", bags: "Bolsas y seguridad", gates: "Puertas y acceso" },
  pt: { restroom: "Casa de banho acessível", medical: "Ponto médico", quiet: "Sala tranquila / sensorial", bags: "Sacos e segurança", gates: "Portões e entrada" },
  fr: { restroom: "Toilettes accessibles", medical: "Point médical", quiet: "Salle calme / sensorielle", bags: "Sacs et sécurité", gates: "Portes et accès" },
  ar: { restroom: "دورة مياه متاحة", medical: "نقطة طبية", quiet: "غرفة هادئة / حسية", bags: "الحقائب والأمن", gates: "البوابات والدخول" },
  hi: { restroom: "सुलभ शौचालय", medical: "चिकित्सा बिंदु", quiet: "शांत / संवेदी कक्ष", bags: "बैग और सुरक्षा", gates: "गेट और प्रवेश" },
};

export function factCategoryLabel(category: FactCategory, locale: Locale): string {
  return (FACT_LABEL[locale] ?? FACT_LABEL.en)[category];
}
