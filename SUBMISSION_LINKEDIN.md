# LinkedIn submission post (draft)

> Paste-ready for the PromptWars dual submission. Trim to taste; keep the
> tool-usage disclosure — it's part of how the challenge validates "genuine
> adoption, not superficial usage."

---

**I built a stadium navigator that a blind fan can drive with their phone camera — for the FIFA World Cup 2026. Solo, in ~2 weeks. Here's the prompt strategy. 🧵**

1 in 6 people live with a disability, and a 48-nation World Cup is a wayfinding
nightmare for them: maps stop at the stadium door, signage is visual-only, and a
"shortest" route can mean stairs a wheelchair can't use or a crowd a blind fan
can't safely cross.

So I built **AtlasAccess**. The same venue map produces a *different, safe* route
for a wheelchair, blind, or sensory-sensitive fan — and if a lift breaks, you
point your camera at it and the app tells you, out loud, where to go instead.

**The key architectural decision — and my biggest prompt lesson:**
My v1 prompt asked Gemini to "return the reroute." I killed it. You must never let
a probabilistic model silently decide a blind person's path. So I split the work:

→ **Gemini (multimodal, on Vertex AI) PERCEIVES** — it reads the photo and
returns structured JSON: `{ obstacleType, severity, guidance }`, at low
temperature with a strict response schema.
→ **A deterministic A\* engine DECIDES** — which passage to close, and the
optimal step-free reroute. Pure TypeScript, 100% unit-tested.

**What GenAI did vs. what I designed:** Gemini turns an image into a description.
Everything safety-critical — the routing, the accessibility cost models, the
"never route a wheelchair over stairs" rule — is deterministic code I own and
tested. The model can fail, get rate-limited, or go offline and the app still
navigates: it degrades gracefully to a rules engine.

**Tools:** Gemini + Vertex AI (perception), Cloud Run (single-container deploy,
keyless via ADC), Firebase Studio / Antigravity (build). Next.js + strict
TypeScript. 41 tests, WCAG-AA, CSP + security headers, Zod-validated inputs.

The lesson I'm taking into every GenAI build: **let the model perceive, let
deterministic code decide.**

Live demo + code 👇
#GoogleAI #Gemini #VertexAI #CloudRun #Accessibility #PromptWars #FIFAWorldCup2026
