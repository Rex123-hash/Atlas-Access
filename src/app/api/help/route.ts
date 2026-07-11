import { NextResponse } from "next/server";
import { answerAppHelp } from "@/lib/concierge/gemini-concierge";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { HelpRequestSchema } from "@/lib/schemas";

const RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const;

/** POST /api/help — the in-app Help AI answers a question about using
 * AtlasAccess via Gemini, grounded in a fixed knowledge blurb. Always responds. */
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

  const parsed = HelpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400, headers });
  }

  const result = await answerAppHelp(parsed.data.question, parsed.data.locale);
  return NextResponse.json(result, { headers });
}
