/**
 * Locale dictionary. Deterministic UI translations for the six shipped
 * languages. Every string a fan can see in the core dashboard is translated
 * here — routes, crowd, planner and venue answers are localized deterministically
 * (see ./templates and the stadium data), with no runtime AI on the critical
 * path. The optional AI assistant may still translate its own free-form replies.
 *
 * All original copy — written for AtlasAccess, not derived from any other work.
 */

export const LOCALES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export type MessageKey =
  | "tagline"
  | "onboardTitle"
  | "onboardStadium"
  | "onboardLanguage"
  | "continue"
  | "capWayfinding"
  | "capAnnounce"
  | "capCrowd"
  | "capPlanner"
  | "distance"
  | "steps"
  | "routingFor"
  | "changeStadium"
  | "noRoute"
  // Dashboard shell & assistant
  | "askAi"
  | "assistantTitle"
  | "assistantIntro"
  | "assistantAsk"
  | "assistantPlaceholder"
  | "commonQuestions"
  | "close"
  | "menu"
  | "answeredByGemini"
  | "translatedByGemini"
  | "aiBadge"
  | "comingSoon"
  // Home / hero
  | "home"
  | "toolHomeDesc"
  | "heroTitle"
  | "heroCta"
  | "overviewChoose"
  | "locationHeading"
  | "indoorRouteHeading"
  // Tool descriptions (sidebar / headers)
  | "toolWayfindingDesc"
  | "toolCrowdDesc"
  | "toolQaDesc"
  | "toolPlannerDesc"
  // Real venue data / accessibility
  | "illustrativeModel"
  | "accessibilityAtVenue"
  | "acEntrance"
  | "acParking"
  | "acRestroom"
  | "acSeating"
  | "liveFromGoogle"
  | "modelledData"
  | "notListed"
  | "yes"
  | "no"
  // Wayfinding
  | "destination"
  | "speakRoute"
  | "scanObstacle"
  | "scanning"
  | "simulateOutage"
  | "clear"
  | "scanHint"
  | "profileWheelchair"
  | "profileBlind"
  | "profileSensory"
  | "profileStandard"
  // Crowd
  | "zonesHeading"
  // Planner
  | "planHeading"
  | "kickOff"
  // Q&A
  | "qaPlaceholder"
  | "qaAsk"
  | "qaFallback"
  | "qaTryAi";

type Dictionary = Record<MessageKey, string>;

const en: Dictionary = {
  tagline: "Your accessibility-first companion for World Cup 2026 — routes, crowds, answers and matchday plans.",
  onboardTitle: "Welcome to AtlasAccess",
  onboardStadium: "Choose your stadium",
  onboardLanguage: "Language",
  continue: "Continue",
  capWayfinding: "Wayfinding",
  capAnnounce: "Q&A",
  capCrowd: "Crowd & Gates",
  capPlanner: "Matchday",
  distance: "Distance",
  steps: "Steps",
  routingFor: "Routing for",
  changeStadium: "Change stadium",
  noRoute: "No accessible route right now — please ask a steward.",
  askAi: "Ask AI",
  assistantTitle: "AI Assistant",
  assistantIntro: "An optional helper. Ask anything about using AtlasAccess — every tool works without it.",
  assistantAsk: "Ask the assistant anything",
  assistantPlaceholder: "e.g. How do I report a broken lift?",
  commonQuestions: "Common questions",
  close: "Close",
  menu: "Menu",
  answeredByGemini: "Answered by Gemini",
  translatedByGemini: "Translated by Gemini",
  aiBadge: "AI",
  comingSoon: "Coming soon",
  home: "Home",
  toolHomeDesc: "Your matchday overview and quick access to every tool.",
  heroTitle: "Move through the match with confidence.",
  heroCta: "Find my step-free route",
  overviewChoose: "Explore the tools",
  locationHeading: "Stadium location",
  indoorRouteHeading: "Indoor step-free route",
  toolWayfindingDesc: "Step-free routing to your seat, restroom, medical point or quiet room.",
  toolCrowdDesc: "See the calmest entrance and live density by zone.",
  toolQaDesc: "Grounded answers to venue questions for this stadium.",
  toolPlannerDesc: "A personalised arrival timeline for matchday.",
  illustrativeModel: "Illustrative model — not surveyed floor data",
  accessibilityAtVenue: "Accessibility at this venue",
  acEntrance: "Step-free entrance",
  acParking: "Accessible parking",
  acRestroom: "Accessible restroom",
  acSeating: "Accessible seating",
  liveFromGoogle: "Live from Google Places",
  modelledData: "Sample data — add a Google Maps key for live info",
  notListed: "Not listed",
  yes: "Yes",
  no: "No",
  destination: "Destination",
  speakRoute: "Speak route",
  scanObstacle: "Scan for obstacles",
  scanning: "Reading…",
  simulateOutage: "Simulate lift outage",
  clear: "Clear",
  scanHint: "Uses your camera and AI to spot an obstacle and reroute.",
  profileWheelchair: "Wheelchair / step-free",
  profileBlind: "Blind / low vision",
  profileSensory: "Low-sensory",
  profileStandard: "Standard",
  zonesHeading: "Live crowd by zone",
  planHeading: "Your matchday timeline",
  kickOff: "Kick-off",
  qaPlaceholder: "Search venue info — restroom, medical, quiet room, bags, gates",
  qaAsk: "Search",
  qaFallback: "I don't have that detail for this stadium yet — please check the venue information point or ask a steward.",
  qaTryAi: "Ask the AI assistant instead",
};

const es: Dictionary = {
  tagline: "Tu compañero accesible para el Mundial 2026: rutas, afluencia, respuestas y planes de partido.",
  onboardTitle: "Bienvenido a AtlasAccess",
  onboardStadium: "Elige tu estadio",
  onboardLanguage: "Idioma",
  continue: "Continuar",
  capWayfinding: "Orientación",
  capAnnounce: "Preguntas",
  capCrowd: "Público y accesos",
  capPlanner: "Día del partido",
  distance: "Distancia",
  steps: "Pasos",
  routingFor: "Ruta para",
  changeStadium: "Cambiar estadio",
  noRoute: "No hay ruta accesible ahora — pregunta a un acomodador.",
  askAi: "Preguntar a la IA",
  assistantTitle: "Asistente de IA",
  assistantIntro: "Un ayudante opcional. Pregunta lo que quieras sobre el uso de AtlasAccess — todas las herramientas funcionan sin él.",
  assistantAsk: "Pregunta lo que sea al asistente",
  assistantPlaceholder: "p. ej. ¿Cómo reporto un ascensor averiado?",
  commonQuestions: "Preguntas frecuentes",
  close: "Cerrar",
  menu: "Menú",
  answeredByGemini: "Respondido por Gemini",
  translatedByGemini: "Traducido por Gemini",
  aiBadge: "IA",
  comingSoon: "Próximamente",
  home: "Inicio",
  toolHomeDesc: "Tu resumen del partido y acceso rápido a todas las herramientas.",
  heroTitle: "Vive el partido con confianza.",
  heroCta: "Encuentra mi ruta sin escalones",
  overviewChoose: "Explora las herramientas",
  locationHeading: "Ubicación del estadio",
  indoorRouteHeading: "Ruta interior sin escalones",
  toolWayfindingDesc: "Rutas sin escalones a tu asiento, baño, punto médico o sala tranquila.",
  toolCrowdDesc: "Ve la entrada más tranquila y la afluencia en vivo por zona.",
  toolQaDesc: "Respuestas fundamentadas a preguntas sobre este estadio.",
  toolPlannerDesc: "Un cronograma de llegada personalizado para el día del partido.",
  illustrativeModel: "Modelo ilustrativo — no son planos reales del recinto",
  accessibilityAtVenue: "Accesibilidad en este recinto",
  acEntrance: "Entrada sin escalones",
  acParking: "Estacionamiento accesible",
  acRestroom: "Baño accesible",
  acSeating: "Asientos accesibles",
  liveFromGoogle: "En vivo desde Google Places",
  modelledData: "Datos de muestra — añade una clave de Google Maps para datos en vivo",
  notListed: "No indicado",
  yes: "Sí",
  no: "No",
  destination: "Destino",
  speakRoute: "Leer la ruta",
  scanObstacle: "Buscar obstáculos",
  scanning: "Leyendo…",
  simulateOutage: "Simular avería del ascensor",
  clear: "Restablecer",
  scanHint: "Usa tu cámara y la IA para detectar un obstáculo y recalcular la ruta.",
  profileWheelchair: "Silla de ruedas / sin escalones",
  profileBlind: "Ciego / baja visión",
  profileSensory: "Bajo estímulo sensorial",
  profileStandard: "Estándar",
  zonesHeading: "Afluencia en vivo por zona",
  planHeading: "Tu cronograma del partido",
  kickOff: "Inicio",
  qaPlaceholder: "Buscar información — baño, médico, sala tranquila, bolsas, puertas",
  qaAsk: "Buscar",
  qaFallback: "Todavía no tengo ese dato para este estadio — consulta el punto de información o pregunta a un acomodador.",
  qaTryAi: "Pregunta al asistente de IA",
};

const pt: Dictionary = {
  tagline: "O teu companheiro acessível para o Mundial 2026: rotas, multidões, respostas e planos de jogo.",
  onboardTitle: "Bem-vindo ao AtlasAccess",
  onboardStadium: "Escolha o seu estádio",
  onboardLanguage: "Idioma",
  continue: "Continuar",
  capWayfinding: "Orientação",
  capAnnounce: "Perguntas",
  capCrowd: "Público e portões",
  capPlanner: "Dia do jogo",
  distance: "Distância",
  steps: "Passos",
  routingFor: "Rota para",
  changeStadium: "Mudar de estádio",
  noRoute: "Sem rota acessível agora — peça ajuda a um assistente.",
  askAi: "Perguntar à IA",
  assistantTitle: "Assistente de IA",
  assistantIntro: "Um ajudante opcional. Pergunte o que quiser sobre como usar o AtlasAccess — todas as ferramentas funcionam sem ele.",
  assistantAsk: "Pergunte qualquer coisa ao assistente",
  assistantPlaceholder: "ex.: Como reporto um elevador avariado?",
  commonQuestions: "Perguntas frequentes",
  close: "Fechar",
  menu: "Menu",
  answeredByGemini: "Respondido pelo Gemini",
  translatedByGemini: "Traduzido pelo Gemini",
  aiBadge: "IA",
  comingSoon: "Em breve",
  home: "Início",
  toolHomeDesc: "A tua visão geral do jogo e acesso rápido a todas as ferramentas.",
  heroTitle: "Viva o jogo com confiança.",
  heroCta: "Encontrar a minha rota sem degraus",
  overviewChoose: "Explore as ferramentas",
  locationHeading: "Localização do estádio",
  indoorRouteHeading: "Rota interior sem degraus",
  toolWayfindingDesc: "Rotas sem degraus para o teu lugar, casa de banho, ponto médico ou sala tranquila.",
  toolCrowdDesc: "Veja a entrada mais calma e a densidade ao vivo por zona.",
  toolQaDesc: "Respostas fundamentadas a perguntas sobre este estádio.",
  toolPlannerDesc: "Uma agenda de chegada personalizada para o dia do jogo.",
  illustrativeModel: "Modelo ilustrativo — não são plantas reais do recinto",
  accessibilityAtVenue: "Acessibilidade neste recinto",
  acEntrance: "Entrada sem degraus",
  acParking: "Estacionamento acessível",
  acRestroom: "Casa de banho acessível",
  acSeating: "Lugares acessíveis",
  liveFromGoogle: "Ao vivo do Google Places",
  modelledData: "Dados de exemplo — adicione uma chave do Google Maps para dados ao vivo",
  notListed: "Não indicado",
  yes: "Sim",
  no: "Não",
  destination: "Destino",
  speakRoute: "Ler a rota",
  scanObstacle: "Procurar obstáculos",
  scanning: "A ler…",
  simulateOutage: "Simular avaria do elevador",
  clear: "Repor",
  scanHint: "Usa a câmara e a IA para detetar um obstáculo e recalcular a rota.",
  profileWheelchair: "Cadeira de rodas / sem degraus",
  profileBlind: "Cego / baixa visão",
  profileSensory: "Baixo estímulo sensorial",
  profileStandard: "Padrão",
  zonesHeading: "Multidão ao vivo por zona",
  planHeading: "A tua agenda do jogo",
  kickOff: "Início",
  qaPlaceholder: "Pesquisar informação — casa de banho, médico, sala tranquila, sacos, portões",
  qaAsk: "Pesquisar",
  qaFallback: "Ainda não tenho esse detalhe para este estádio — consulte o ponto de informação ou pergunte a um assistente.",
  qaTryAi: "Pergunte ao assistente de IA",
};

const fr: Dictionary = {
  tagline: "Votre compagnon accessible pour la Coupe du monde 2026 : itinéraires, affluence, réponses et plans de match.",
  onboardTitle: "Bienvenue sur AtlasAccess",
  onboardStadium: "Choisissez votre stade",
  onboardLanguage: "Langue",
  continue: "Continuer",
  capWayfinding: "Orientation",
  capAnnounce: "Questions",
  capCrowd: "Foule et portes",
  capPlanner: "Jour du match",
  distance: "Distance",
  steps: "Étapes",
  routingFor: "Itinéraire pour",
  changeStadium: "Changer de stade",
  noRoute: "Aucun itinéraire accessible pour le moment — demandez à un agent.",
  askAi: "Demander à l'IA",
  assistantTitle: "Assistant IA",
  assistantIntro: "Une aide facultative. Posez vos questions sur l'utilisation d'AtlasAccess — tous les outils fonctionnent sans elle.",
  assistantAsk: "Posez n'importe quelle question à l'assistant",
  assistantPlaceholder: "ex. : Comment signaler un ascenseur en panne ?",
  commonQuestions: "Questions fréquentes",
  close: "Fermer",
  menu: "Menu",
  answeredByGemini: "Répondu par Gemini",
  translatedByGemini: "Traduit par Gemini",
  aiBadge: "IA",
  comingSoon: "Bientôt disponible",
  home: "Accueil",
  toolHomeDesc: "Votre aperçu du match et un accès rapide à tous les outils.",
  heroTitle: "Vivez le match en toute confiance.",
  heroCta: "Trouver mon itinéraire sans marches",
  overviewChoose: "Explorez les outils",
  locationHeading: "Emplacement du stade",
  indoorRouteHeading: "Itinéraire intérieur sans marches",
  toolWayfindingDesc: "Itinéraires sans marches vers votre siège, les toilettes, le point médical ou la salle calme.",
  toolCrowdDesc: "Voyez l'entrée la plus calme et l'affluence en direct par zone.",
  toolQaDesc: "Des réponses fiables aux questions sur ce stade.",
  toolPlannerDesc: "Un programme d'arrivée personnalisé pour le jour du match.",
  illustrativeModel: "Modèle illustratif — pas des plans réels du site",
  accessibilityAtVenue: "Accessibilité de ce site",
  acEntrance: "Entrée sans marches",
  acParking: "Parking accessible",
  acRestroom: "Toilettes accessibles",
  acSeating: "Places accessibles",
  liveFromGoogle: "En direct de Google Places",
  modelledData: "Données d'exemple — ajoutez une clé Google Maps pour des données en direct",
  notListed: "Non indiqué",
  yes: "Oui",
  no: "Non",
  destination: "Destination",
  speakRoute: "Lire l'itinéraire",
  scanObstacle: "Détecter les obstacles",
  scanning: "Lecture…",
  simulateOutage: "Simuler une panne d'ascenseur",
  clear: "Réinitialiser",
  scanHint: "Utilise votre caméra et l'IA pour repérer un obstacle et recalculer l'itinéraire.",
  profileWheelchair: "Fauteuil roulant / sans marches",
  profileBlind: "Aveugle / malvoyant",
  profileSensory: "Faible stimulation sensorielle",
  profileStandard: "Standard",
  zonesHeading: "Affluence en direct par zone",
  planHeading: "Votre programme du match",
  kickOff: "Coup d'envoi",
  qaPlaceholder: "Rechercher des infos — toilettes, secours, salle calme, sacs, portes",
  qaAsk: "Rechercher",
  qaFallback: "Je n'ai pas encore ce détail pour ce stade — consultez le point d'information ou demandez à un agent.",
  qaTryAi: "Demandez à l'assistant IA",
};

const ar: Dictionary = {
  tagline: "رفيقك الميسّر لكأس العالم 2026: مسارات، وازدحام، وإجابات، وخطط ليوم المباراة.",
  onboardTitle: "مرحبًا بك في AtlasAccess",
  onboardStadium: "اختر ملعبك",
  onboardLanguage: "اللغة",
  continue: "متابعة",
  capWayfinding: "الإرشاد",
  capAnnounce: "الأسئلة",
  capCrowd: "الحشود والبوابات",
  capPlanner: "يوم المباراة",
  distance: "المسافة",
  steps: "الخطوات",
  routingFor: "المسار لـ",
  changeStadium: "تغيير الملعب",
  noRoute: "لا يوجد مسار متاح الآن — يرجى سؤال أحد المنظمين.",
  askAi: "اسأل الذكاء الاصطناعي",
  assistantTitle: "مساعد الذكاء الاصطناعي",
  assistantIntro: "مساعد اختياري. اسأل أي شيء عن استخدام AtlasAccess — تعمل كل الأدوات بدونه.",
  assistantAsk: "اسأل المساعد أي شيء",
  assistantPlaceholder: "مثل: كيف أبلّغ عن مصعد معطّل؟",
  commonQuestions: "الأسئلة الشائعة",
  close: "إغلاق",
  menu: "القائمة",
  answeredByGemini: "بواسطة Gemini",
  translatedByGemini: "تُرجم بواسطة Gemini",
  aiBadge: "ذكاء اصطناعي",
  comingSoon: "قريبًا",
  home: "الرئيسية",
  toolHomeDesc: "نظرة عامة على يوم المباراة ووصول سريع إلى كل الأدوات.",
  heroTitle: "تنقّل في المباراة بثقة.",
  heroCta: "أوجد مساري بدون درج",
  overviewChoose: "استكشف الأدوات",
  locationHeading: "موقع الملعب",
  indoorRouteHeading: "المسار الداخلي بدون درج",
  toolWayfindingDesc: "مسارات بدون درج إلى مقعدك أو دورة المياه أو النقطة الطبية أو الغرفة الهادئة.",
  toolCrowdDesc: "شاهد المدخل الأهدأ والكثافة المباشرة حسب المنطقة.",
  toolQaDesc: "إجابات موثوقة عن أسئلة هذا الملعب.",
  toolPlannerDesc: "جدول وصول مخصص ليوم المباراة.",
  illustrativeModel: "نموذج توضيحي — ليست مخططات فعلية للمكان",
  accessibilityAtVenue: "إمكانية الوصول في هذا المكان",
  acEntrance: "مدخل بدون درج",
  acParking: "موقف سيارات متاح",
  acRestroom: "دورة مياه متاحة",
  acSeating: "مقاعد متاحة",
  liveFromGoogle: "مباشر من Google Places",
  modelledData: "بيانات تجريبية — أضف مفتاح Google Maps للبيانات المباشرة",
  notListed: "غير مُدرج",
  yes: "نعم",
  no: "لا",
  destination: "الوجهة",
  speakRoute: "نطق المسار",
  scanObstacle: "فحص العوائق",
  scanning: "جارٍ القراءة…",
  simulateOutage: "محاكاة عطل المصعد",
  clear: "مسح",
  scanHint: "يستخدم كاميرتك والذكاء الاصطناعي لرصد عائق وإعادة توجيه المسار.",
  profileWheelchair: "كرسي متحرك / بدون درج",
  profileBlind: "كفيف / ضعف البصر",
  profileSensory: "حساسية حسية منخفضة",
  profileStandard: "قياسي",
  zonesHeading: "الازدحام المباشر حسب المنطقة",
  planHeading: "جدول يوم المباراة",
  kickOff: "انطلاق المباراة",
  qaPlaceholder: "ابحث في معلومات المكان — دورة المياه، الإسعاف، الغرفة الهادئة، الحقائب، البوابات",
  qaAsk: "بحث",
  qaFallback: "لا أملك هذه المعلومة لهذا الملعب بعد — يرجى مراجعة نقطة المعلومات أو سؤال أحد المنظمين.",
  qaTryAi: "اسأل مساعد الذكاء الاصطناعي بدلاً من ذلك",
};

const hi: Dictionary = {
  tagline: "विश्व कप 2026 के लिए आपका सुलभता-प्रथम साथी — मार्ग, भीड़, उत्तर और मैचडे योजनाएँ।",
  onboardTitle: "AtlasAccess में आपका स्वागत है",
  onboardStadium: "अपना स्टेडियम चुनें",
  onboardLanguage: "भाषा",
  continue: "आगे बढ़ें",
  capWayfinding: "मार्गदर्शन",
  capAnnounce: "प्रश्न",
  capCrowd: "भीड़ और गेट",
  capPlanner: "मैचडे",
  distance: "दूरी",
  steps: "चरण",
  routingFor: "मार्ग किसके लिए",
  changeStadium: "स्टेडियम बदलें",
  noRoute: "अभी कोई सुलभ रास्ता नहीं — कृपया किसी स्टीवर्ड से पूछें।",
  askAi: "AI से पूछें",
  assistantTitle: "AI सहायक",
  assistantIntro: "एक वैकल्पिक सहायक। AtlasAccess के उपयोग के बारे में कुछ भी पूछें — हर उपकरण इसके बिना भी काम करता है।",
  assistantAsk: "सहायक से कुछ भी पूछें",
  assistantPlaceholder: "जैसे: खराब लिफ्ट की शिकायत कैसे करूँ?",
  commonQuestions: "सामान्य प्रश्न",
  close: "बंद करें",
  menu: "मेनू",
  answeredByGemini: "Gemini द्वारा उत्तर",
  translatedByGemini: "Gemini द्वारा अनुवादित",
  aiBadge: "AI",
  comingSoon: "जल्द आ रहा है",
  home: "होम",
  toolHomeDesc: "आपका मैचडे अवलोकन और हर उपकरण तक त्वरित पहुँच।",
  heroTitle: "मैच में आत्मविश्वास के साथ चलें।",
  heroCta: "मेरा सीढ़ी-रहित रास्ता खोजें",
  overviewChoose: "उपकरण देखें",
  locationHeading: "स्टेडियम स्थान",
  indoorRouteHeading: "इनडोर सीढ़ी-रहित मार्ग",
  toolWayfindingDesc: "आपकी सीट, शौचालय, चिकित्सा बिंदु या शांत कक्ष तक सीढ़ी-रहित मार्ग।",
  toolCrowdDesc: "सबसे शांत प्रवेश और क्षेत्र अनुसार लाइव भीड़ देखें।",
  toolQaDesc: "इस स्टेडियम के प्रश्नों के प्रमाणित उत्तर।",
  toolPlannerDesc: "मैचडे के लिए एक व्यक्तिगत आगमन समय-सारिणी।",
  illustrativeModel: "उदाहरणात्मक मॉडल — वास्तविक फ़्लोर डेटा नहीं",
  accessibilityAtVenue: "इस स्थल पर सुलभता",
  acEntrance: "सीढ़ी-रहित प्रवेश",
  acParking: "सुलभ पार्किंग",
  acRestroom: "सुलभ शौचालय",
  acSeating: "सुलभ बैठक",
  liveFromGoogle: "Google Places से लाइव",
  modelledData: "नमूना डेटा — लाइव जानकारी के लिए Google Maps कुंजी जोड़ें",
  notListed: "सूचीबद्ध नहीं",
  yes: "हाँ",
  no: "नहीं",
  destination: "गंतव्य",
  speakRoute: "मार्ग सुनाएँ",
  scanObstacle: "बाधाएँ स्कैन करें",
  scanning: "पढ़ रहा है…",
  simulateOutage: "लिफ्ट खराबी अनुकरण",
  clear: "साफ़ करें",
  scanHint: "बाधा पहचानने और मार्ग बदलने के लिए आपके कैमरे और AI का उपयोग करता है।",
  profileWheelchair: "व्हीलचेयर / सीढ़ी-रहित",
  profileBlind: "दृष्टिहीन / कम दृष्टि",
  profileSensory: "कम-संवेदी",
  profileStandard: "मानक",
  zonesHeading: "क्षेत्र अनुसार लाइव भीड़",
  planHeading: "आपकी मैचडे समय-सारिणी",
  kickOff: "किक-ऑफ",
  qaPlaceholder: "स्थल जानकारी खोजें — शौचालय, चिकित्सा, शांत कक्ष, बैग, गेट",
  qaAsk: "खोजें",
  qaFallback: "इस स्टेडियम के लिए मेरे पास अभी वह जानकारी नहीं है — कृपया सूचना केंद्र देखें या किसी स्टीवर्ड से पूछें।",
  qaTryAi: "इसके बजाय AI सहायक से पूछें",
};

export const MESSAGES: Record<Locale, Dictionary> = { en, es, pt, fr, ar, hi };
