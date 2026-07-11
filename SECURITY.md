# Security

## Headers
`next.config.ts` sets a strict security header suite on every response:
- **Content-Security-Policy** — `default-src 'self'`; network egress limited to
  Google Generative AI / Vertex endpoints for the obstacle read.
- **X-Frame-Options: DENY** and `frame-ancestors 'none'` — clickjacking defence.
- **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **HSTS**,
  **Permissions-Policy** (camera/geolocation scoped to self, microphone off).

## Input validation
- Every field of the `/api/vision-reroute` payload is validated and **bounded**
  with Zod (`src/lib/schemas.ts`): image size is capped, ids are length-limited,
  the profile is an enum. Malformed JSON and invalid payloads return `400`
  without reaching the model.
- The image is only ever forwarded to Gemini as `inlineData`; it is never
  persisted or logged.

## Abuse protection
- Per-IP fixed-window **rate limiting** (`src/lib/rate-limit.ts`) protects the
  model endpoint from quota exhaustion, returning `429` with `Retry-After`.

## Secrets & auth
- **No secrets in the repository.** `.env*` is git-ignored (`.env.example` is the
  only committed template).
- Production authentication is **Application Default Credentials** — the Cloud
  Run service account provides Vertex AI access; there is no API key in code.

## Safe degradation as a security property
- The perception layer **never throws** and never lets a model failure break
  navigation. A malformed or hostile model response falls back to the
  deterministic rules engine, so the safety-critical routing path cannot be
  influenced by the model output.
