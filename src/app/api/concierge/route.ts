import { NextResponse } from "next/server";
import { localizeText } from "@/lib/concierge/gemini-concierge";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { LocalizeRequestSchema } from "@/lib/schemas";

const RATE_LIMIT = { limit: 40, windowMs: 60_000 } as const;

/** POST /api/concierge — translate/rephrase a grounded answer into the fan's
 * language via Gemini. Always responds (falls back to the original text). */
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

  const parsed = LocalizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400, headers });
  }

  const result = await localizeText(parsed.data.text, parsed.data.locale);
  return NextResponse.json(result, { headers });
}
