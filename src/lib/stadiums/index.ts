import type { VenueGraph } from "../graph/types";
import type { Locale } from "../i18n/messages";
import { DESTINATIONS, SAMPLE_VENUE } from "../graph/venue";
import { AZTECA_DESTINATIONS, AZTECA_GRAPH } from "./azteca";
import { SOFI_DESTINATIONS, SOFI_GRAPH } from "./sofi";
import { BCPLACE_DESTINATIONS, BCPLACE_GRAPH } from "./bcplace";

/** A venue answer, written natively in every shipped language so the language
 * selector works with no runtime AI. Place names stay as proper nouns. */
export type LocalizedText = Record<Locale, string>;

/** Fixed set of curated venue-info topics, used to label the Q&A quick list. */
export type FactCategory = "restroom" | "medical" | "quiet" | "bags" | "gates";

/** A grounded fact used by the Q&A capability: match on keywords, answer in the
 * fan's language deterministically. */
export interface StadiumFact {
  readonly category: FactCategory;
  readonly keywords: readonly string[];
  readonly answer: LocalizedText;
}

export interface CrowdZone {
  readonly id: string;
  readonly label: string;
  /** Live-ish crowd density 0..1 (seeded; a real deploy streams this). */
  readonly density: number;
}

/** Real-world coordinates, used only for the location/context map — the indoor
 * routing graph is schematic and does not use these. */
export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

export interface Stadium {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  /** Short country code shown as a text badge (no emoji flags anywhere). */
  readonly countryCode: string;
  /** Whether a full venue graph is wired (else "coming soon"). */
  readonly available: boolean;
  /** Real-world location for the context map (optional for unbuilt venues). */
  readonly location?: GeoPoint;
  readonly graph: VenueGraph;
  readonly destinations: readonly string[];
  /** Default routing origin (the fan's entry point). */
  readonly entranceId: string;
  readonly facts: readonly StadiumFact[];
  readonly zones: readonly CrowdZone[];
}

const METLIFE: Stadium = {
  id: "metlife",
  name: "MetLife Stadium",
  city: "New York / New Jersey",
  country: "USA",
  countryCode: "US",
  available: true,
  location: { lat: 40.8135, lng: -74.0745 },
  graph: SAMPLE_VENUE,
  destinations: DESTINATIONS,
  entranceId: "transit",
  facts: [
    {
      category: "restroom",
      keywords: ["restroom", "toilet", "bathroom", "wc", "baño", "banheiro", "toilette"],
      answer: {
        en: "The nearest fully accessible restroom is on the West Concourse, about 100 m from the West Entrance.",
        es: "El baño totalmente accesible más cercano está en el West Concourse, a unos 100 m de la West Entrance.",
        pt: "A casa de banho totalmente acessível mais próxima fica no West Concourse, a cerca de 100 m da West Entrance.",
        fr: "Les toilettes entièrement accessibles les plus proches se trouvent au West Concourse, à environ 100 m de la West Entrance.",
        ar: "أقرب دورة مياه متاحة بالكامل تقع في West Concourse، على بُعد نحو 100 م من West Entrance.",
        hi: "निकटतम पूर्णतः सुलभ शौचालय West Concourse पर है, West Entrance से लगभग 100 मी दूर।",
      },
    },
    {
      category: "medical",
      keywords: ["medical", "first aid", "doctor", "médico", "medico", "secours"],
      answer: {
        en: "The Medical Point is on the West Concourse, next to the accessible restroom. In an emergency, ask any steward or dial the venue hotline.",
        es: "El Punto Médico está en el West Concourse, junto al baño accesible. En caso de emergencia, pregunta a cualquier acomodador o llama a la línea directa del recinto.",
        pt: "O Ponto Médico fica no West Concourse, ao lado da casa de banho acessível. Em emergência, pergunte a qualquer assistente ou ligue para a linha direta do recinto.",
        fr: "Le point médical se trouve au West Concourse, à côté des toilettes accessibles. En cas d'urgence, demandez à un agent ou appelez la ligne directe du site.",
        ar: "النقطة الطبية في West Concourse، بجوار دورة المياه المتاحة. في حالة الطوارئ، اسأل أي منظّم أو اتصل بالخط الساخن للمكان.",
        hi: "चिकित्सा बिंदु West Concourse पर है, सुलभ शौचालय के बगल में। आपात स्थिति में किसी भी स्टीवर्ड से पूछें या स्थल हॉटलाइन पर कॉल करें।",
      },
    },
    {
      category: "quiet",
      keywords: ["quiet", "sensory", "calm", "autism", "tranquilo", "sensorial", "calme"],
      answer: {
        en: "A Sensory Quiet Room is available near the West Entrance — a low-noise, low-light space you can use any time during the match.",
        es: "Hay una Sala Sensorial Tranquila cerca de la West Entrance: un espacio de poco ruido y poca luz que puedes usar en cualquier momento del partido.",
        pt: "Há uma Sala Sensorial Tranquila perto da West Entrance — um espaço de pouco ruído e pouca luz que podes usar a qualquer momento do jogo.",
        fr: "Une salle sensorielle calme est disponible près de la West Entrance — un espace peu bruyant et peu éclairé, utilisable à tout moment pendant le match.",
        ar: "تتوفر غرفة حسية هادئة قرب West Entrance — مساحة منخفضة الضوضاء والإضاءة يمكنك استخدامها في أي وقت خلال المباراة.",
        hi: "West Entrance के पास एक संवेदी शांत कक्ष उपलब्ध है — कम शोर, कम रोशनी वाला स्थान जिसे आप मैच के दौरान कभी भी उपयोग कर सकते हैं।",
      },
    },
    {
      category: "bags",
      keywords: ["bag", "prohibited", "allowed", "security", "bolsa", "sac"],
      answer: {
        en: "Only clear bags up to 30 cm are permitted. Arrive 90 minutes early for accessible security lanes at the West Entrance.",
        es: "Solo se permiten bolsas transparentes de hasta 30 cm. Llega 90 minutos antes para usar los carriles de seguridad accesibles en la West Entrance.",
        pt: "Só são permitidos sacos transparentes até 30 cm. Chega 90 minutos antes para as vias de segurança acessíveis na West Entrance.",
        fr: "Seuls les sacs transparents jusqu'à 30 cm sont autorisés. Arrivez 90 minutes à l'avance pour les files de sécurité accessibles à la West Entrance.",
        ar: "يُسمح فقط بالحقائب الشفافة حتى 30 سم. احضر قبل 90 دقيقة لاستخدام مسارات التفتيش المتاحة عند West Entrance.",
        hi: "केवल 30 सेमी तक के पारदर्शी बैग की अनुमति है। West Entrance पर सुलभ सुरक्षा लेन के लिए 90 मिनट पहले पहुँचें।",
      },
    },
    {
      category: "gates",
      keywords: ["gate", "open", "entry", "puerta", "porte"],
      answer: {
        en: "Gates open 2 hours before kick-off. The West Entrance has step-free access and priority lanes for disabled fans.",
        es: "Las puertas abren 2 horas antes del inicio. La West Entrance tiene acceso sin escalones y carriles prioritarios para aficionados con discapacidad.",
        pt: "Os portões abrem 2 horas antes do início. A West Entrance tem acesso sem degraus e vias prioritárias para adeptos com deficiência.",
        fr: "Les portes ouvrent 2 heures avant le coup d'envoi. La West Entrance offre un accès sans marches et des files prioritaires pour les supporters handicapés.",
        ar: "تفتح البوابات قبل ساعتين من انطلاق المباراة. يوفّر West Entrance دخولًا بدون درج ومسارات ذات أولوية للمشجعين ذوي الإعاقة.",
        hi: "गेट किक-ऑफ से 2 घंटे पहले खुलते हैं। West Entrance में सीढ़ी-रहित प्रवेश और दिव्यांग प्रशंसकों के लिए प्राथमिकता लेन हैं।",
      },
    },
  ],
  zones: [
    { id: "west_gate", label: "West Entrance", density: 0.82 },
    { id: "transit", label: "Transit Hub", density: 0.68 },
    { id: "concourse_e", label: "East Concourse", density: 0.55 },
    { id: "concourse_upper", label: "Upper Concourse", density: 0.31 },
  ],
};

const AZTECA: Stadium = {
  id: "azteca",
  name: "Estadio Azteca",
  city: "Mexico City",
  country: "Mexico",
  countryCode: "MX",
  available: true,
  location: { lat: 19.3029, lng: -99.1505 },
  graph: AZTECA_GRAPH,
  destinations: AZTECA_DESTINATIONS,
  entranceId: "az_metro",
  facts: [
    {
      category: "restroom",
      keywords: ["restroom", "toilet", "bathroom", "baño", "banheiro"],
      answer: {
        en: "The accessible restroom (Baño Accesible) is on the Explanada Sur, near the Ascensor Sur lift.",
        es: "El baño accesible (Baño Accesible) está en la Explanada Sur, cerca del Ascensor Sur.",
        pt: "A casa de banho acessível (Baño Accesible) fica na Explanada Sur, perto do elevador Ascensor Sur.",
        fr: "Les toilettes accessibles (Baño Accesible) se trouvent sur l'Explanada Sur, près de l'ascenseur Ascensor Sur.",
        ar: "دورة المياه المتاحة (Baño Accesible) في Explanada Sur، قرب مصعد Ascensor Sur.",
        hi: "सुलभ शौचालय (Baño Accesible) Explanada Sur पर है, Ascensor Sur लिफ्ट के पास।",
      },
    },
    {
      category: "medical",
      keywords: ["medical", "first aid", "médico", "medico"],
      answer: {
        en: "The Punto Médico is on the Explanada Sur, beside the accessible restroom.",
        es: "El Punto Médico está en la Explanada Sur, junto al baño accesible.",
        pt: "O Punto Médico fica na Explanada Sur, ao lado da casa de banho acessível.",
        fr: "Le Punto Médico se trouve sur l'Explanada Sur, à côté des toilettes accessibles.",
        ar: "‎Punto Médico‎ في Explanada Sur، بجوار دورة المياه المتاحة.",
        hi: "Punto Médico Explanada Sur पर है, सुलभ शौचालय के बगल में।",
      },
    },
    {
      category: "quiet",
      keywords: ["quiet", "sensory", "sensorial", "tranquilo"],
      answer: {
        en: "A Sala Sensorial (quiet room) is located near Puerta 4 for fans who need a calm, low-sensory space.",
        es: "Hay una Sala Sensorial (sala tranquila) cerca de la Puerta 4 para aficionados que necesitan un espacio tranquilo y de bajo estímulo.",
        pt: "Há uma Sala Sensorial (sala tranquila) perto da Puerta 4 para adeptos que precisam de um espaço calmo e de baixo estímulo.",
        fr: "Une Sala Sensorial (salle calme) est située près de la Puerta 4 pour les supporters qui ont besoin d'un espace calme et peu stimulant.",
        ar: "توجد Sala Sensorial (غرفة هادئة) قرب Puerta 4 للمشجعين الذين يحتاجون مساحة هادئة ومنخفضة الإثارة.",
        hi: "Puerta 4 के पास एक Sala Sensorial (शांत कक्ष) है, उन प्रशंसकों के लिए जिन्हें शांत, कम-संवेदी स्थान चाहिए।",
      },
    },
    {
      category: "gates",
      keywords: ["gate", "puerta", "open", "entry"],
      answer: {
        en: "Puerta 4 offers step-free access via a ramp from Metro Línea 2 and opens 2 hours before kick-off.",
        es: "La Puerta 4 ofrece acceso sin escalones mediante una rampa desde el Metro Línea 2 y abre 2 horas antes del inicio.",
        pt: "A Puerta 4 oferece acesso sem degraus através de uma rampa a partir do Metro Línea 2 e abre 2 horas antes do início.",
        fr: "La Puerta 4 offre un accès sans marches via une rampe depuis le Metro Línea 2 et ouvre 2 heures avant le coup d'envoi.",
        ar: "توفّر Puerta 4 دخولًا بدون درج عبر منحدر من Metro Línea 2 وتفتح قبل ساعتين من انطلاق المباراة.",
        hi: "Puerta 4, Metro Línea 2 से एक रैंप के माध्यम से सीढ़ी-रहित प्रवेश देती है और किक-ऑफ से 2 घंटे पहले खुलती है।",
      },
    },
  ],
  zones: [
    { id: "az_gate", label: "Puerta 4", density: 0.79 },
    { id: "az_metro", label: "Metro Línea 2", density: 0.74 },
    { id: "az_explanada", label: "Explanada Sur", density: 0.6 },
    { id: "az_nivel2", label: "Nivel Cabañas", density: 0.35 },
  ],
};

const SOFI: Stadium = {
  id: "sofi",
  name: "SoFi Stadium",
  city: "Los Angeles",
  country: "USA",
  countryCode: "US",
  available: true,
  location: { lat: 33.9535, lng: -118.3392 },
  graph: SOFI_GRAPH,
  destinations: SOFI_DESTINATIONS,
  entranceId: "sf_transit",
  facts: [
    {
      category: "restroom",
      keywords: ["restroom", "toilet", "bathroom", "washroom", "baño", "banheiro"],
      answer: {
        en: "The nearest accessible restroom is on AA Plaza, about 100 m from Entry Gate G, beside the North Elevator.",
        es: "El baño accesible más cercano está en AA Plaza, a unos 100 m de Entry Gate G, junto al North Elevator.",
        pt: "A casa de banho acessível mais próxima fica na AA Plaza, a cerca de 100 m da Entry Gate G, ao lado do North Elevator.",
        fr: "Les toilettes accessibles les plus proches se trouvent à AA Plaza, à environ 100 m de Entry Gate G, à côté du North Elevator.",
        ar: "أقرب دورة مياه متاحة في AA Plaza، على بُعد نحو 100 م من Entry Gate G، بجوار North Elevator.",
        hi: "निकटतम सुलभ शौचालय AA Plaza पर है, Entry Gate G से लगभग 100 मी दूर, North Elevator के बगल में।",
      },
    },
    {
      category: "medical",
      keywords: ["medical", "first aid", "doctor", "médico", "medico"],
      answer: {
        en: "The Medical Point is on AA Plaza, next to the accessible restroom. In an emergency, ask any steward.",
        es: "El Punto Médico está en AA Plaza, junto al baño accesible. En caso de emergencia, pregunta a cualquier acomodador.",
        pt: "O Ponto Médico fica na AA Plaza, ao lado da casa de banho acessível. Em emergência, pergunte a qualquer assistente.",
        fr: "Le point médical se trouve à AA Plaza, à côté des toilettes accessibles. En cas d'urgence, demandez à un agent.",
        ar: "النقطة الطبية في AA Plaza، بجوار دورة المياه المتاحة. في حالة الطوارئ، اسأل أي منظّم.",
        hi: "चिकित्सा बिंदु AA Plaza पर है, सुलभ शौचालय के बगल में। आपात स्थिति में किसी भी स्टीवर्ड से पूछें।",
      },
    },
    {
      category: "quiet",
      keywords: ["quiet", "sensory", "calm", "autism", "sensorial", "tranquilo"],
      answer: {
        en: "A Sensory Quiet Room is near Entry Gate G — a low-noise, low-light space open throughout the match.",
        es: "Hay una Sala Sensorial Tranquila cerca de Entry Gate G: un espacio de poco ruido y poca luz abierto durante todo el partido.",
        pt: "Há uma Sala Sensorial Tranquila perto da Entry Gate G — um espaço de pouco ruído e pouca luz aberto durante todo o jogo.",
        fr: "Une salle sensorielle calme se trouve près de Entry Gate G — un espace peu bruyant et peu éclairé, ouvert pendant tout le match.",
        ar: "توجد غرفة حسية هادئة قرب Entry Gate G — مساحة منخفضة الضوضاء والإضاءة ومفتوحة طوال المباراة.",
        hi: "Entry Gate G के पास एक संवेदी शांत कक्ष है — कम शोर, कम रोशनी वाला स्थान जो पूरे मैच के दौरान खुला रहता है।",
      },
    },
    {
      category: "gates",
      keywords: ["gate", "open", "entry", "puerta", "porte"],
      answer: {
        en: "Entry Gate G has step-free access from the Metro / Rideshare Hub and opens 2 hours before kick-off.",
        es: "Entry Gate G tiene acceso sin escalones desde el Metro / Rideshare Hub y abre 2 horas antes del inicio.",
        pt: "A Entry Gate G tem acesso sem degraus a partir do Metro / Rideshare Hub e abre 2 horas antes do início.",
        fr: "Entry Gate G offre un accès sans marches depuis le Metro / Rideshare Hub et ouvre 2 heures avant le coup d'envoi.",
        ar: "توفّر Entry Gate G دخولًا بدون درج من Metro / Rideshare Hub وتفتح قبل ساعتين من انطلاق المباراة.",
        hi: "Entry Gate G, Metro / Rideshare Hub से सीढ़ी-रहित प्रवेश देती है और किक-ऑफ से 2 घंटे पहले खुलती है।",
      },
    },
  ],
  zones: [
    { id: "sf_gate", label: "Entry Gate G", density: 0.8 },
    { id: "sf_transit", label: "Metro / Rideshare Hub", density: 0.7 },
    { id: "sf_plaza", label: "AA Plaza", density: 0.58 },
    { id: "sf_upper", label: "Upper Concourse", density: 0.33 },
  ],
};

const BCPLACE: Stadium = {
  id: "bcplace",
  name: "BC Place",
  city: "Vancouver",
  country: "Canada",
  countryCode: "CA",
  available: true,
  location: { lat: 49.2768, lng: -123.112 },
  graph: BCPLACE_GRAPH,
  destinations: BCPLACE_DESTINATIONS,
  entranceId: "bc_transit",
  facts: [
    {
      category: "restroom",
      keywords: ["restroom", "toilet", "bathroom", "washroom", "baño", "banheiro"],
      answer: {
        en: "The nearest accessible washroom is on Terry Fox Plaza, about 100 m from Gate A, near the NE Elevator.",
        es: "El baño accesible más cercano está en Terry Fox Plaza, a unos 100 m de Gate A, cerca del NE Elevator.",
        pt: "A casa de banho acessível mais próxima fica na Terry Fox Plaza, a cerca de 100 m da Gate A, perto do NE Elevator.",
        fr: "Les toilettes accessibles les plus proches se trouvent à Terry Fox Plaza, à environ 100 m de Gate A, près du NE Elevator.",
        ar: "أقرب دورة مياه متاحة في Terry Fox Plaza، على بُعد نحو 100 م من Gate A، قرب NE Elevator.",
        hi: "निकटतम सुलभ वॉशरूम Terry Fox Plaza पर है, Gate A से लगभग 100 मी दूर, NE Elevator के पास।",
      },
    },
    {
      category: "medical",
      keywords: ["medical", "first aid", "doctor", "médico", "medico"],
      answer: {
        en: "First Aid is on Terry Fox Plaza, beside the accessible washroom. In an emergency, ask any steward.",
        es: "Los Primeros Auxilios están en Terry Fox Plaza, junto al baño accesible. En caso de emergencia, pregunta a cualquier acomodador.",
        pt: "Os Primeiros Socorros ficam na Terry Fox Plaza, ao lado da casa de banho acessível. Em emergência, pergunte a qualquer assistente.",
        fr: "Les premiers secours se trouvent à Terry Fox Plaza, à côté des toilettes accessibles. En cas d'urgence, demandez à un agent.",
        ar: "الإسعافات الأولية في Terry Fox Plaza، بجوار دورة المياه المتاحة. في حالة الطوارئ، اسأل أي منظّم.",
        hi: "प्राथमिक चिकित्सा Terry Fox Plaza पर है, सुलभ वॉशरूम के बगल में। आपात स्थिति में किसी भी स्टीवर्ड से पूछें।",
      },
    },
    {
      category: "quiet",
      keywords: ["quiet", "sensory", "calm", "autism", "sensorial", "tranquilo"],
      answer: {
        en: "A Sensory Room is near Gate A — a calm, low-sensory space open throughout the match.",
        es: "Hay una Sala Sensorial cerca de Gate A: un espacio tranquilo y de bajo estímulo abierto durante todo el partido.",
        pt: "Há uma Sala Sensorial perto da Gate A — um espaço calmo e de baixo estímulo aberto durante todo o jogo.",
        fr: "Une salle sensorielle se trouve près de Gate A — un espace calme et peu stimulant, ouvert pendant tout le match.",
        ar: "توجد غرفة حسية قرب Gate A — مساحة هادئة ومنخفضة الإثارة ومفتوحة طوال المباراة.",
        hi: "Gate A के पास एक संवेदी कक्ष है — शांत, कम-संवेदी स्थान जो पूरे मैच के दौरान खुला रहता है।",
      },
    },
    {
      category: "gates",
      keywords: ["gate", "open", "entry", "puerta", "porte"],
      answer: {
        en: "Gate A offers step-free access from SkyTrain Stadium Station and opens 2 hours before kick-off.",
        es: "Gate A ofrece acceso sin escalones desde la SkyTrain Stadium Station y abre 2 horas antes del inicio.",
        pt: "A Gate A oferece acesso sem degraus a partir da SkyTrain Stadium Station e abre 2 horas antes do início.",
        fr: "Gate A offre un accès sans marches depuis la SkyTrain Stadium Station et ouvre 2 heures avant le coup d'envoi.",
        ar: "توفّر Gate A دخولًا بدون درج من SkyTrain Stadium Station وتفتح قبل ساعتين من انطلاق المباراة.",
        hi: "Gate A, SkyTrain Stadium Station से सीढ़ी-रहित प्रवेश देती है और किक-ऑफ से 2 घंटे पहले खुलती है।",
      },
    },
  ],
  zones: [
    { id: "bc_gate", label: "Gate A", density: 0.77 },
    { id: "bc_transit", label: "SkyTrain Stadium Stn", density: 0.72 },
    { id: "bc_plaza", label: "Terry Fox Plaza", density: 0.55 },
    { id: "bc_upper", label: "Upper Concourse", density: 0.3 },
  ],
};

export const STADIUMS: readonly Stadium[] = [METLIFE, AZTECA, SOFI, BCPLACE];

export const DEFAULT_STADIUM_ID = "metlife";

export function getStadium(id: string): Stadium | undefined {
  return STADIUMS.find((s) => s.id === id);
}
