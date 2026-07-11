# LinkedIn submission post

> Paste-ready. No emojis (matches the project brand). Attach a 30–60s screen
> recording (open app → type a request → route draws on the map → read aloud)
> and/or a screenshot of the dashboard. Covers the challenge's required
> disclosure: which tools, why, how prompts evolved, GenAI vs. human.

---

I built an AI concierge that a blind or wheelchair-using fan can use to navigate a FIFA World Cup 2026 stadium — by typing one sentence, in any of six languages.

It is called AtlasAccess, and it is live: https://atlasaccess.web.app

The problem: a 48-nation World Cup draws millions of fans who speak dozens of languages, and roughly one in six people live with a disability. Maps stop at the stadium door. Signage is visual-only. Information desks do not speak your language.

So I built a prompt-first dashboard. You type "step-free route to Section 112 avoiding crowds" — or the same request in Spanish, Hindi or Arabic — and it answers: a stairs-free route drawn on a live map, read aloud, in your language.

The prompt strategy, and the biggest lesson:
My first version asked Gemini to return the route directly. I threw it out. You must never let a probabilistic model silently decide a blind person's path.

So I split the whole system on one principle:
Let the model PERCEIVE and ANSWER. Let deterministic code DECIDE and EXECUTE.

- Gemini (on Vertex AI) understands the free-text request, answers grounded strictly in the venue's real facts, translates across six languages, and can read a photo of a blocked lift.
- A deterministic, 100%-unit-tested A* engine computes the actual step-free route, the crowd ranking and the matchday plan.
- Every AI path has a deterministic fallback and never throws, so the app works offline and never leaves a fan without an answer.

How the prompts evolved:
v1: "return the reroute" — unsafe, rejected.
v2: Gemini answers and perceives; code decides and executes.
v3: added grounding context, low temperature, and a strict never-throws fallback.

What GenAI did vs. what I designed:
GenAI: free text to a grounded answer, English to six languages, image to obstacle description.
Me: the A* engine, the accessibility cost models, the intent parser, the crowd and planner logic, and 114 tests.

The Google stack, running in production:
Gemini on Vertex AI · Cloud Run (backend) · Firebase Hosting (frontend) · Google Places API (real venue data).

Engineering: Next.js with strict TypeScript, WCAG 2.1 AA accessibility, CSP + Zod + rate limiting, 114 passing tests, and a react-doctor health score of 100/100.

Live: https://atlasaccess.web.app
Code: https://github.com/Rex123-hash/Atlas-Access

Accessibility should not be a feature you add at the end. For a World Cup that belongs to everyone, it should be the first prompt.

#GoogleAI #Gemini #VertexAI #CloudRun #Firebase #Accessibility #PromptWars #BuildWithAI #FIFAWorldCup2026 #GenAI
