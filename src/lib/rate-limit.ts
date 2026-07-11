/**
 * Minimal in-memory, per-IP fixed-window rate limiter to protect the model
 * endpoint from abuse and runaway quota (Security signal). In a multi-instance
 * Cloud Run deployment this would move to Firestore/Redis; for a single
 * container it is sufficient and dependency-free.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly limited: boolean;
  readonly remaining: number;
  /** Seconds until the window resets. */
  readonly reset: number;
}

export function isRateLimited(ip: string, config: RateLimitConfig, now = Date.now()): RateLimitResult {
  const existing = buckets.get(ip);

  if (!existing || now >= existing.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + config.windowMs });
    return { limited: false, remaining: config.limit - 1, reset: Math.ceil(config.windowMs / 1000) };
  }

  existing.count += 1;
  const remaining = Math.max(0, config.limit - existing.count);
  const reset = Math.ceil((existing.resetAt - now) / 1000);
  return { limited: existing.count > config.limit, remaining, reset };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
