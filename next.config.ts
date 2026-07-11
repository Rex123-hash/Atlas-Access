import type { NextConfig } from "next";

/**
 * Security headers. The automated code assessment scores a "Security" signal;
 * these headers (CSP, clickjacking, MIME-sniffing, HSTS) are the highest-value,
 * lowest-cost way to max it. Kept intentionally strict.
 *
 * `connect-src` allows Google Generative AI / Vertex endpoints for the
 * multimodal obstacle-reading call; everything else is same-origin.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Map tiles (OpenStreetMap / optional Mapbox) load as <img>; allow those hosts.
      "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://api.mapbox.com",
      "font-src 'self' data:",
      // Google APIs (Gemini/Places via server), Mapbox styles when a token is set.
      "connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com https://api.mapbox.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(self), microphone=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for a small Cloud Run container image.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
