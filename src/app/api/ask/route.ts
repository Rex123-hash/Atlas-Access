import { NextResponse } from "next/server";
import { getStadium } from "@/lib/stadiums";
import { groundedAsk, venueContext } from "@/lib/concierge/ask";
import { askStadium } from "@/lib/concierge/gemini-concierge";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { AskRequestSchema } from "@/lib/schemas";

const RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const;

/**
 * POST /api/ask — the "Ask AtlasAccess" front door.
 *
 * Deterministic grounding classifies the request and picks the tool + a grounded
 * answer; Gemini then answers on the primary path, grounded in the venue
 * context. Always responds — falls back to the deterministic answer if Gemini is
 * unavailable. Returns { answer, tool, source }.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { limited, remaining, reset } = isRateLimited(ip, RATE_LIMIT);
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };
  if (limited) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers });
  }

  const parsed = AskRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400, headers });
  }

  const stadium = getStadium(parsed.data.stadiumId);
  if (!stadium) {
    return NextResponse.json({ error: "Unknown stadium." }, { status: 404, headers });
  }

  const base = groundedAsk(parsed.data.query, stadium, parsed.data.locale);
  let answer = base.answer;
  let source: "gemini" | "grounded" = "grounded";

  try {
    const ai = await askStadium(parsed.data.query, venueContext(stadium), parsed.data.locale);
    if (ai.source === "gemini" && ai.text) {
      answer = ai.text;
      source = "gemini";
    }
  } catch {
    // keep the deterministic grounded answer
  }

  return NextResponse.json({ answer, tool: base.tool, source }, { headers });
}
