<div align="center">

<img src="public/atlas-logo.svg" alt="AtlasAccess logo" width="104" height="104" />

# AtlasAccess

### The accessibility-first AI concierge for the FIFA World Cup 2026

Type a request in any of six languages and get a step-free route, a grounded venue answer, the calmest gate, or a matchday plan — on a deterministic engine, with a Gemini concierge on the primary path.

**Live app:** **https://atlasaccess.web.app** — Firebase Hosting (frontend) → Cloud Run (backend), Gemini live

**Stack:** Next.js 16 · React 19 · TypeScript (strict) · Gemini on Vertex AI · Google Places · Cloud Run · Firebase Hosting

**Quality bar:** 114 passing tests · 100% engine coverage · WCAG 2.1 AA · react-doctor 100 / 100

</div>

---

## The problem

A 48-nation World Cup across 16 stadiums draws millions of fans who speak dozens of languages — and roughly **one in six people live with a disability**. Today they juggle a maps app that stops at the stadium door, visual-only signage, and information desks that do not speak their language. AtlasAccess replaces all of that with a single question.

## What it does

A clean SaaS dashboard with four tools plus a natural-language front door:

| Surface | What the fan gets | How |
| --- | --- | --- |
| **Ask AtlasAccess** | Type anything in any language; Gemini answers, grounded in the venue's real facts, and routes you to the right tool with one tap. | Gemini on Vertex AI + deterministic fallback |
| **Wayfinding** | A step-free, low-crowd or low-sensory route to your seat, restroom, medical point or quiet room, on a live map, read aloud, with camera obstacle rerouting. | Deterministic A\* over an accessibility-weighted graph |
| **Announcements & Q&A** | Grounded answers to venue questions in your language. | Curated per-stadium facts, hand-translated to 6 languages |
| **Crowd & Gates** | The calmest entry right now, with per-zone density. | Deterministic density ranking |
| **Matchday Planner** | A personalised arrival timeline that gives accessible fans extra time. | Deterministic planner |

## Prompt-first, and safe by design

The core principle: **let the model understand and answer, let deterministic code decide and execute.**

```
"llévame en silla de ruedas a la sección 112"
        |
        v  parseIntent()  — deterministic, multilingual, unit-tested
{ capability: wayfinding, profile: wheelchair, destination: section_112 }
        |
        v  A* routing engine — deterministic, optimal, unit-tested
step-free route + turn-by-turn directions
        |
        v  Gemini on Vertex AI — answers the fan, grounded in venue facts
localized guidance  (falls back to the grounded answer if AI is unavailable)
```

Intent parsing, routing, crowd and planner logic are deterministic and fully tested, so the app is correct and works offline. Gemini adds the natural-language front door, the multilingual phrasing and the multimodal obstacle reading — and every AI path degrades gracefully, so a fan is never left without an answer.

## Generative AI usage (submission disclosure)

| Requirement | This project |
| --- | --- |
| **Which tools** | Gemini (Vertex AI) for the "Ask AtlasAccess" concierge, the help assistant and multimodal obstacle reading; Cloud Run for the container backend; Firebase Hosting for the public frontend; Google Places API for real venue data. |
| **Why** | Only perception and language need a model — understanding a free-text request, phrasing a grounded answer, reading a photo of a broken lift. Everything safety-critical (routing, which passage to close) stays deterministic. |
| **How prompts evolved** | v1 asked Gemini to return the route directly and was rejected — a model must never silently decide a blind fan's path. v2 split it: Gemini answers and perceives, deterministic code decides and executes. v3 added grounding context, low temperature and a never-throws fallback. |
| **GenAI vs. human** | GenAI: free-text question to grounded answer, English to six languages, image to obstacle description. Human and deterministic: the A\* engine, accessibility cost models, intent parser, crowd and planner logic, and all 114 tests. |

## Languages

English, Spanish, Portuguese, French, Arabic (right-to-left) and Hindi. Type in any of them; switch the interface language from the top bar and every tool re-renders instantly.

## Stadiums and real venue data

Four real 2026 venues, each with its own indoor graph, crowd zones and facts translated into all six languages: **MetLife Stadium**, **Estadio Azteca**, **SoFi Stadium** and **BC Place**. The location map uses the Google Places API (server-side key, graceful fallback) plus a Leaflet map; the indoor step-free route is a clearly labelled illustrative model, because indoor wheelchair-bay layouts are venue-private data with no public API.

## Architecture

```
Firebase Hosting (public frontend, CDN)
        |  rewrites all traffic
        v
Cloud Run (single container: Next.js SSR + API routes = the backend)
        |-- deterministic engines (in-process): intent, A* routing, qa, crowd, planner
        |-- POST /api/ask              Gemini concierge, grounded, routes to a tool
        |-- POST /api/vision-reroute   Gemini multimodal obstacle reading -> rules
        |-- POST /api/venue            Google Places (New) real venue data
        `-- Gemini on Vertex AI via Application Default Credentials (no key in repo)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md), [ACCESSIBILITY.md](./ACCESSIBILITY.md), [SECURITY.md](./SECURITY.md), [DEPLOY.md](./DEPLOY.md).

## Quality gates

```bash
npm run test         # 114 tests; 100% statements/functions/lines on the engines
npm run type-check   # strict TypeScript, noUncheckedIndexedAccess
npm run lint         # ESLint + jsx-a11y
npm run build        # production build (standalone output)
npm run doctor       # react-doctor health score: 100 / 100
```

## Run locally

```bash
npm install
cp .env.example .env.local     # optional — the app works with no keys
npm run dev                    # http://localhost:3000
```

Enable live Gemini by setting `USE_GEMINI=true` and either `GEMINI_API_KEY` (AI Studio) or `USE_VERTEX=true` + `GOOGLE_CLOUD_PROJECT` (Vertex AI via Application Default Credentials). Set `GOOGLE_MAPS_API_KEY` for real Google Places venue data.

## Deploy — Cloud Run backend, Firebase Hosting frontend

Full runbook in [DEPLOY.md](./DEPLOY.md). In short:

```bash
# 1. Backend: deploy the Next.js container to Cloud Run
gcloud run deploy atlas-access --source . --region us-central1 --allow-unauthenticated \
  --set-env-vars USE_GEMINI=true,USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT

# 2. Frontend: Firebase Hosting rewrites all traffic to the Cloud Run service
firebase deploy --only hosting
```

Production authentication is Application Default Credentials (the Cloud Run service account) — there is no API key in the repository.

## Originality

Every line here is original work for AtlasAccess: the A\* engine, the multilingual intent parser, the i18n dictionaries, the crowd and planner engines and all venue data were written from scratch. Built on Next.js and React with Gemini on Vertex AI.

## License

MIT — see [LICENSE](./LICENSE).
