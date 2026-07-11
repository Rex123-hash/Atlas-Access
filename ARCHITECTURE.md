# Architecture

AtlasAccess is deliberately structured as a **pure deterministic core** with a
thin probabilistic (Gemini) layer at the edge. This is the single most important
design decision: routing a disabled fan is safety-critical, so it must be
deterministic, explainable and testable — the model is confined to *perception*.

## Layers

| Layer | Modules | Rule |
| --- | --- | --- |
| **Domain (pure)** | `src/lib/graph/`, `src/lib/routing/` | Deterministic math and data. No I/O, no framework imports. 100% unit-testable. |
| **Perception** | `src/lib/gemini.ts`, `src/lib/rules-fallback.ts` | `gemini.ts` calls Vertex AI to *read* an obstacle photo; `rules-fallback.ts` is the always-available deterministic path. The public entry point **never throws — it degrades**. |
| **Transport** | `src/app/api/vision-reroute/route.ts`, `src/lib/schemas.ts`, `src/lib/rate-limit.ts` | Thin route; Zod validates and bounds every input at the edge; per-IP rate limiting. |
| **Presentation** | `src/components/`, `src/app/` | WCAG-AA UI. The authoritative route is a screen-reader-first ordered list; the SVG map is `aria-hidden` decoration. |

**Dependencies point inward.** The presentation and API depend on the routing
core; the core imports nothing above it. Cloud SDKs are **lazily imported**
inside the code path that uses them, so local dev and CI need no credentials.

## Data flow

```
profile + destination  ─┐
closures (real-time)   ─┼─►  findRoute(graph, start, goal, profile, closures)  ─►  RouteResult
                        │       (pure A*, admissible heuristic → optimal)          { path, steps, reason }
camera image  ─► /api/vision-reroute ─► interpretObstacle()
                                          ├─ Gemini (Vertex): image → {type, severity, guidance}
                                          └─ rules: decide which passage to close  ─► closures update ─► reroute
```

## The routing engine

- **Algorithm:** A* over a bidirectional weighted graph, using a binary min-heap
  open set (`src/lib/routing/heap.ts`).
- **Accessibility as cost:** each `AccessibilityProfile` maps passage features to
  a traversal cost; `Infinity` marks a passage impassable (e.g. stairs for a
  wheelchair user). The same graph therefore produces different safe routes.
- **Admissible heuristic:** map coordinates and real passage distances live on
  different scales, so the straight-line estimate is multiplied by the smallest
  distance-per-coordinate ratio in the graph. This guarantees the heuristic is a
  lower bound on cost → A* returns the **optimal** (lowest-effort) route. Verified
  by the test suite (e.g. the 560 m standard route assertion).
- **Graceful failure:** unknown/closed endpoints and fully-blocked routes return
  a `found: false` result with a clear reason — the engine never throws.

### Complexity

- Adjacency build: **O(V + E)**.
- A* frontier operations: **O(E log V)** with the binary heap.
- Route reconstruction and instruction generation: **O(P)** in path length.

## Testing strategy

`src/lib/routing/**`, `src/lib/graph/**` and `src/lib/rules-fallback.ts` are held
to **100% statements / functions / lines and ≥95% branches** (enforced in
`vitest.config.ts`). Tests assert real behaviour: wheelchair routes never contain
stairs, lift closures force ramp reroutes, sensory routes are longer but calmer,
optimal distances match hand-computed values, and every failure mode degrades
rather than throwing.
