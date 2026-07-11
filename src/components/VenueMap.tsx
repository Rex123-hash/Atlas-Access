"use client";

import type { NodeType, VenueGraph, VenueNode } from "@/lib/graph/types";

interface VenueMapProps {
  readonly graph: VenueGraph;
  readonly path: readonly string[];
  readonly closedEdgeIds: ReadonlySet<string>;
}

const NODE_COLORS: Record<NodeType, string> = {
  transit: "#38bdf8",
  entrance: "#34d399",
  concourse: "#94a3b8",
  lift: "#a78bfa",
  ramp: "#2dd4bf",
  stairs: "#f59e0b",
  section: "#10b981",
  restroom: "#60a5fa",
  medical: "#f87171",
  quiet_room: "#818cf8",
};

type Anchor = "start" | "middle" | "end";
interface LabelPlacement {
  readonly anchor: Anchor;
  readonly dx: number;
  readonly dy: number;
}

/** Generic, collision-avoiding label placement that works for any stadium graph
 * laid out on our shared ~1080×650 schematic: nodes near the left/right edges
 * get side labels; central nodes get labels above (upper deck) or below. */
function placeLabel(n: VenueNode): LabelPlacement {
  if (n.x < 260) return { anchor: "start", dx: 16, dy: 4 };
  if (n.x > 820) return { anchor: "end", dx: -16, dy: 4 };
  return n.y < 220 ? { anchor: "middle", dx: 0, dy: -16 } : { anchor: "middle", dx: 0, dy: 26 };
}

/**
 * Visual venue map. Supplementary only: the authoritative, screen-reader
 * accessible route is the ordered <RouteSteps> list, so the SVG is aria-hidden.
 */
export default function VenueMap({ graph, path, closedEdgeIds }: VenueMapProps) {
  const pathPairs = new Set<string>();
  for (let i = 1; i < path.length; i++) {
    pathPairs.add(`${path[i - 1]}|${path[i]}`);
    pathPairs.add(`${path[i]}|${path[i - 1]}`);
  }
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const start = path[0];
  const goal = path[path.length - 1];

  return (
    <svg
      viewBox="0 0 1080 650"
      className="w-full rounded-2xl border border-border"
      style={{ background: "radial-gradient(120% 120% at 20% 10%, rgba(79,70,229,0.05), transparent 60%), var(--surface-2)" }}
      aria-hidden="true"
      focusable="false"
    >
      {/* Base passages */}
      {graph.edges.map((edge) => {
        const a = nodeById.get(edge.from);
        const b = nodeById.get(edge.to);
        if (!a || !b) return null;
        const closed = closedEdgeIds.has(edge.id);
        const onPath = pathPairs.has(`${edge.from}|${edge.to}`);
        if (onPath && !closed) return null; // drawn in the highlighted pass below
        return (
          <line
            key={edge.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={closed ? "var(--danger)" : "rgba(100,116,139,0.4)"}
            strokeWidth={closed ? 3 : 2}
            strokeDasharray={closed ? "8 7" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {/* Highlighted route: a soft glow underlay + a solid line on top */}
      {graph.edges.map((edge) => {
        const a = nodeById.get(edge.from);
        const b = nodeById.get(edge.to);
        if (!a || !b) return null;
        if (closedEdgeIds.has(edge.id)) return null;
        if (!pathPairs.has(`${edge.from}|${edge.to}`)) return null;
        return (
          <g key={`p-${edge.id}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(79,70,229,0.25)" strokeWidth={12} strokeLinecap="round" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })}

      {/* Nodes */}
      {graph.nodes.map((n) => {
        const isEndpoint = n.id === start || n.id === goal;
        const color = NODE_COLORS[n.type];
        const place = placeLabel(n);
        return (
          <g key={n.id}>
            {isEndpoint && (
              <circle cx={n.x} cy={n.y} r={16} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={isEndpoint ? 10 : 7}
              fill={color}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={isEndpoint ? 2.5 : 1.5}
            />
            <text
              x={n.x + place.dx}
              y={n.y + place.dy}
              fontSize={15}
              fontWeight={isEndpoint ? 700 : 500}
              textAnchor={place.anchor}
              fill={isEndpoint ? "#0f172a" : "#475569"}
              stroke="#ffffff"
              strokeWidth={3.5}
              paintOrder="stroke"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
