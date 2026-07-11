import { NextResponse } from "next/server";
import { SAMPLE_VENUE } from "@/lib/graph/venue";
import { getStadium } from "@/lib/stadiums";
import { interpretObstacle } from "@/lib/gemini";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { ObstacleInterpretationSchema, VisionRerouteRequestSchema } from "@/lib/schemas";

const RATE_LIMIT = { limit: 20, windowMs: 60_000 } as const;

/**
 * POST /api/vision-reroute
 * Body: { imageBase64, nearNodeId, profileId }
 * Returns an ObstacleInterpretation. Always responds; the underlying reader
 * degrades to deterministic rules if the model is unavailable.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { limited, remaining, reset } = isRateLimited(ip, RATE_LIMIT);
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(RATE_LIMIT.limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };

  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { ...headers, "Retry-After": String(reset) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers });
  }

  const parsed = VisionRerouteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400, headers },
    );
  }

  const graph = getStadium(parsed.data.stadiumId)?.graph ?? SAMPLE_VENUE;
  const interpretation = await interpretObstacle(graph, parsed.data);
  // Validate the outbound contract so the client always receives a well-formed
  // interpretation, even if the perception layer is changed later.
  const safe = ObstacleInterpretationSchema.parse(interpretation);
  return NextResponse.json(safe, { headers });
}
