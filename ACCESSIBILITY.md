# Accessibility

Accessibility is not a feature of AtlasAccess — it is the product. The app is
built to WCAG 2.1 AA and treats disabled fans as the primary users.

## For blind / low-vision fans
- **Screen-reader-first route.** The authoritative route is a semantic ordered
  list (`<ol>`); the SVG map is `aria-hidden` so it can never produce confusing
  duplicate announcements.
- **Spoken turn-by-turn** via the Web Speech API (`src/lib/tts.ts`), toggled by a
  clearly labelled `aria-pressed` "Voice" button.
- **Live regions:** the route summary uses `aria-live="assertive"` (a new safe
  route is important enough to interrupt); obstacle-scan status uses
  `aria-live="polite"`.
- **Camera as an input modality** — a blind fan can photograph a passage and hear
  what is wrong and where to go instead.

## For wheelchair users
- Stairs are **impassable** in the wheelchair cost model — never routed over.
- Lifts and gentle ramps are preferred; steeper inclines cost more effort.
- Lift-outage reports trigger an immediate step-free reroute or an honest
  "no step-free route — ask a steward" message.

## For neurodivergent / sensory-sensitive fans
- The low-sensory profile minimises noise, bright light and crowding, accepting a
  longer physical route for a calmer one, and can route to a **quiet room**.

## Cross-cutting
- **Keyboard operable:** all controls are native `button`, `input`, `select`,
  `fieldset`/`legend` and `label` elements; a visible high-contrast
  `:focus-visible` outline meets WCAG 2.4.7.
- **Skip link** to main content.
- **Reduced motion:** `prefers-reduced-motion` disables animation.
- **Semantic structure:** landmark `main`, grouped radio controls, associated
  labels for every input.
- **Automated a11y linting:** `eslint-plugin-jsx-a11y` (bundled via
  `eslint-config-next`) runs in `npm run lint` and must pass.

## Known limitations / next steps
- The sample venue graph is illustrative; production would ingest real venue
  accessibility data (IMDF / venue GIS).
- Live lift/closure status would come from a Firebase real-time feed and venue
  facilities systems rather than manual reports.
