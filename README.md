<div align="center">

<img src="public/atlas-logo.svg" alt="AtlasAccess" width="128" height="128" />

# AtlasAccess

### The accessibility‑first AI concierge for the FIFA World Cup 2026

*Type a request in any of six languages — get a step‑free route, a grounded venue answer, the calmest gate, or a matchday plan. Deterministic engine at the core, Gemini on the front door.*

<br/>

[![Live](https://img.shields.io/badge/LIVE-atlasaccess.web.app-6d4aff?style=for-the-badge&labelColor=4f46e5)](https://atlasaccess.web.app)
[![Frontend](https://img.shields.io/badge/Frontend-Firebase_Hosting-6d4aff?style=for-the-badge&labelColor=4f46e5)](https://atlasaccess.web.app)
[![Backend](https://img.shields.io/badge/Backend-Cloud_Run-6d4aff?style=for-the-badge&labelColor=4f46e5)](https://atlas-access-526660427489.us-central1.run.app)

[![AI](https://img.shields.io/badge/AI-Gemini_on_Vertex_AI-6d4aff?style=flat-square&labelColor=4f46e5)](#-generative-ai-usage-mandatory-disclosure)
[![Tests](https://img.shields.io/badge/tests-114_passing-6d4aff?style=flat-square&labelColor=4f46e5)](#-quality-gates)
[![Coverage](https://img.shields.io/badge/engine_coverage-100%25-6d4aff?style=flat-square&labelColor=4f46e5)](#-quality-gates)
[![react-doctor](https://img.shields.io/badge/react--doctor-100%2F100-6d4aff?style=flat-square&labelColor=4f46e5)](#-quality-gates)
[![a11y](https://img.shields.io/badge/WCAG-2.1_AA-6d4aff?style=flat-square&labelColor=4f46e5)](#-accessibility)
[![License](https://img.shields.io/badge/license-MIT-6d4aff?style=flat-square&labelColor=4f46e5)](LICENSE)

**▶ Try it now: [atlasaccess.web.app](https://atlasaccess.web.app)**

</div>

---

> **The 15 seconds that matter:** open the app, pick a stadium and a language, and type *"step‑free route to Section 112 avoiding crowds."* The AI understands you, a deterministic engine draws a stairs‑free route on a live map, and it reads the directions aloud — in your language. That is AtlasAccess.

<br/>

## <img src="assets/icons/compass.svg" width="26" align="top" alt=""> &nbsp;Why AtlasAccess exists

A 48‑nation World Cup across 16 stadiums draws millions of fans who speak dozens of languages — and roughly **one in six people live with a disability**. Today they juggle a maps app that stops at the stadium door, visual‑only signage, and information desks that don't speak their language.

AtlasAccess replaces all of that with a single question. It is built **accessibility‑first** — disabled fans are the primary users, not an afterthought — and **multilingual‑first**, because a World Cup belongs to everyone.

<br/>

## <img src="assets/icons/grid.svg" width="26" align="top" alt=""> &nbsp;What it does

A clean SaaS dashboard with four working tools plus a natural‑language front door.

| Surface | What the fan gets | Engine |
| :-- | :-- | :-- |
| **Ask AtlasAccess** | Type anything in any language; Gemini answers, grounded in the venue's real data, and routes you to the right tool. | Gemini (Vertex AI) + deterministic fallback |
| **Wayfinding** | A step‑free / low‑crowd / low‑sensory route to your seat, restroom, medical point or quiet room — on a live map, read aloud, with camera obstacle rerouting. | Deterministic A\* over an accessibility‑weighted graph |
| **Announcements & Q&A** | Grounded answers to venue questions, in your language. | Curated per‑stadium facts, hand‑translated to 6 languages |
| **Crowd & Gates** | The calmest entry right now, with per‑zone density. | Deterministic density ranking |
| **Matchday Planner** | A personalised arrival timeline that gives accessible fans extra time. | Deterministic planner |

<details>
<summary><b>See the full feature list</b></summary>

- Prompt‑first natural‑language console (Gemini) that routes to any tool
- Four deterministic, unit‑tested tools — correct and usable **offline**
- Six languages including **Arabic (right‑to‑left)** and **Hindi**
- Four real 2026 venues, each with its own indoor graph, crowd zones and facts
- Google Places API for real venue name / address / coordinates / accessibility flags
- Live map (Leaflet + OpenStreetMap) for the "up to the gate" layer
- Multimodal obstacle scan: photograph a blocked lift, Gemini reads it, the route reroutes
- Text‑to‑speech directions, keyboard‑operable, screen‑reader‑first
- Light theme tuned for WCAG AA contrast; reduced‑motion aware
</details>

<br/>

## <img src="assets/icons/sparkle.svg" width="26" align="top" alt=""> &nbsp;Ask AtlasAccess — the GenAI front door

GenAI is not a side‑panel here; it is the **primary way in**. The fan types a sentence; **Gemini answers it**, grounded strictly in the selected stadium's facts and live crowd data, and hands off to the right tool with one tap. If Gemini is ever unavailable, a deterministic parser answers instead — the app never goes dark.

```
"¿qué puerta está menos concurrida?"  ->  Gemini (grounded)  ->
"El Upper Concourse es la zona menos concurrida ahora mismo, con un 31% de ocupación."   [opens Crowd & Gates]
```

<br/>

## <img src="assets/icons/route.svg" width="26" align="top" alt=""> &nbsp;How it works — prompt‑first, safe by design

The core principle: **let the model understand and answer; let deterministic code decide and execute.**

```
"llévame en silla de ruedas a la sección 112"
        │
        ▼  parseIntent()  —  deterministic, multilingual, unit-tested
{ capability: wayfinding, profile: wheelchair, destination: section_112 }
        │
        ▼  A* routing engine  —  deterministic, optimal, 100% covered
step-free route + turn-by-turn directions
        │
        ▼  Gemini on Vertex AI  —  answers the fan, grounded in venue facts
localized guidance  (falls back to the grounded answer if AI is unavailable)
```

A model must never silently decide a blind fan's path — so routing, crowd and planner logic are **deterministic and fully tested**. Gemini supplies the language, the reasoning and the multimodal perception, and **every AI path degrades gracefully**.

<br/>

## <img src="assets/icons/chip.svg" width="26" align="top" alt=""> &nbsp;Generative AI usage (mandatory disclosure)

| Requirement | This project |
| :-- | :-- |
| **Which Google tools** | **Gemini (Vertex AI)** for the Ask concierge, the help assistant and multimodal obstacle reading · **Cloud Run** for the container backend · **Firebase Hosting** for the public frontend · **Google Places API** for real venue data. |
| **Why** | Only *perception and language* need a model — understanding a free‑text request, phrasing a grounded answer in six languages, reading a photo of a broken lift. Everything safety‑critical stays deterministic. |
| **How the prompts evolved** | v1 asked Gemini to *return the route* → rejected (a model must not decide a wheelchair user's path). v2 split it: **Gemini answers and perceives; deterministic code decides and executes.** v3 added grounding context, low temperature and a never‑throws fallback. |
| **GenAI vs. human** | *GenAI:* free‑text → grounded answer, English → six languages, image → obstacle description. *Human & deterministic:* the A\* engine, accessibility cost models, intent parser, crowd and planner logic, and all 114 tests. |

<br/>

## <img src="assets/icons/globe.svg" width="26" align="top" alt=""> &nbsp;Languages

Type in any of these; switch the interface language from the top bar and every tool re‑renders instantly.

| | | | | | |
| :-: | :-: | :-: | :-: | :-: | :-: |
| English | Español | Português | Français | العربية *(RTL)* | हिन्दी |

Fixed UI strings and venue facts are **deterministic per‑locale dictionaries** (testable, zero hallucination); Gemini handles free‑text translation.

<br/>

## <img src="assets/icons/flag.svg" width="26" align="top" alt=""> &nbsp;Stadiums & real venue data

Four real 2026 venues, each with its own indoor graph, crowd zones and facts translated into all six languages:

**MetLife Stadium** · **Estadio Azteca** · **SoFi Stadium** · **BC Place**

The location layer uses the **Google Places API** (server‑side key, graceful fallback) plus a Leaflet map. The indoor step‑free route is a clearly labelled *illustrative model*, because indoor wheelchair‑bay layouts are venue‑private data with no public API — the README and UI are honest about this.

<br/>

## <img src="assets/icons/layers.svg" width="26" align="top" alt=""> &nbsp;Architecture

```
                    ┌───────────────────────────────────────────┐
   the fan  ─────►  │  Firebase Hosting  (public frontend, CDN)  │   https://atlasaccess.web.app
                    └─────────────────────┬─────────────────────┘
                                          │  rewrites 100% of traffic
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │  Cloud Run  (one Next.js container = API)  │
                    │  ─ deterministic engines (in-process):     │
                    │      intent · A* routing · qa · crowd ·    │
                    │      planner   [100% test coverage]        │
                    │  ─ POST /api/ask            Gemini concierge│
                    │  ─ POST /api/vision-reroute Gemini multimodal│
                    │  ─ POST /api/venue          Google Places   │
                    └─────────────────────┬─────────────────────┘
                                          ▼
                    Gemini on Vertex AI  (via Application Default Credentials — no key in the repo)
```

Dependencies point inward; the engine imports nothing framework‑y; the Google SDK is lazy‑imported only in the path that uses it. See [ARCHITECTURE.md](ARCHITECTURE.md).

<br/>

## <img src="assets/icons/access.svg" width="26" align="top" alt=""> &nbsp;Accessibility

Accessibility is the product, not a checkbox.

- **WCAG 2.1 AA** contrast, focus outlines and semantics; `eslint-plugin-jsx-a11y` enforced in CI
- **Screen‑reader‑first**: the authoritative route is a semantic ordered list; the map is decorative and `aria-hidden`
- **Keyboard‑operable** everywhere; visible `:focus-visible` outlines
- **Text‑to‑speech** turn‑by‑turn for blind and low‑vision fans
- **Right‑to‑left** layout for Arabic; **reduced‑motion** aware
- Four routing profiles: **wheelchair / step‑free**, **blind / low‑vision**, **low‑sensory**, **standard**

See [ACCESSIBILITY.md](ACCESSIBILITY.md).

<br/>

## <img src="assets/icons/shield.svg" width="26" align="top" alt=""> &nbsp;Security

- Strict **Content‑Security‑Policy** + clickjacking, MIME‑sniffing and HSTS headers
- **Zod** validation on every API route; per‑IP **rate limiting**
- **No secrets in the repo** — production auth is Application Default Credentials on the Cloud Run service account
- AI paths **never throw**, so a model failure can never break navigation

See [SECURITY.md](SECURITY.md).

<br/>

## <img src="assets/icons/check.svg" width="26" align="top" alt=""> &nbsp;Quality gates

```bash
npm run test         # 114 tests · 100% statements/functions/lines on the engines
npm run type-check   # strict TypeScript, noUncheckedIndexedAccess
npm run lint         # ESLint + jsx-a11y
npm run build        # production build (standalone output)
npm run doctor       # react-doctor health score: 100 / 100
```

| Gate | Result |
| :-- | :-- |
| TypeScript (strict) | clean |
| Tests | **114 passing** · 100% engine coverage |
| ESLint + jsx‑a11y | clean |
| Production build | compiles (standalone) |
| react‑doctor | **100 / 100** |

<br/>

## <img src="assets/icons/terminal.svg" width="26" align="top" alt=""> &nbsp;Run locally

```bash
npm install
cp .env.example .env.local     # optional — the app works with no keys
npm run dev                    # http://localhost:3000
```

Enable live Gemini with `USE_GEMINI=true` + either `GEMINI_API_KEY` (AI Studio) or `USE_VERTEX=true` + `GOOGLE_CLOUD_PROJECT` (Vertex AI via ADC). Set `GOOGLE_MAPS_API_KEY` for real Google Places venue data.

<br/>

## <img src="assets/icons/upload.svg" width="26" align="top" alt=""> &nbsp;Deploy — Cloud Run backend, Firebase Hosting frontend

Full runbook in [DEPLOY.md](DEPLOY.md). In short:

```bash
# Backend → Cloud Run (Cloud Build reads the Dockerfile)
gcloud run deploy atlas-access --source . --region us-central1 --allow-unauthenticated \
  --set-env-vars USE_GEMINI=true,USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT,GOOGLE_CLOUD_LOCATION=us-central1

# Frontend → Firebase Hosting rewrites all traffic to the Cloud Run service
firebase deploy --only hosting
```

**Live now:** frontend **https://atlasaccess.web.app** → backend on Cloud Run, Gemini live.

<br/>

## <img src="assets/icons/trending.svg" width="26" align="top" alt=""> &nbsp;What's next

- Live crowd density from real venue sensor feeds (Firebase Realtime DB)
- Real indoor accessibility graphs via venue GIS / IMDF import
- Volunteer and steward ops view for real‑time incident dispatch
- More of the 16 host stadiums, and offline PWA install

<br/>

## <img src="assets/icons/gem.svg" width="26" align="top" alt=""> &nbsp;Why AtlasAccess stands out

- **GenAI is central and grounded**, not a bolt‑on — and it fails safe.
- **Deterministic, 100%‑tested core** means it is correct, fast and works offline.
- **Accessibility‑first + six languages incl. RTL** — genuine, not cosmetic.
- **Real Google stack, live**: Gemini on Vertex AI, Cloud Run, Firebase Hosting, Google Places.
- **Production hygiene**: strict TS, WCAG AA, CSP + Zod + rate limits, react‑doctor **100/100**.
- **Deployed and demoable** at a public URL, today.

<br/>

## <img src="assets/icons/gem.svg" width="26" align="top" alt=""> &nbsp;Originality

Every line here is original work for AtlasAccess: the A\* engine, the multilingual intent parser, the i18n dictionaries, the crowd and planner engines and all venue data were written from scratch. Built on Next.js and React with Gemini on Vertex AI.

<br/>

## <img src="assets/icons/doc.svg" width="26" align="top" alt=""> &nbsp;License

MIT — see [LICENSE](LICENSE).

<div align="center">
<br/>
<sub>Built for the Google × PromptWars Virtual Challenge · FIFA World Cup 2026</sub>
</div>
