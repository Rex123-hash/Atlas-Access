import { z } from "zod";

/**
 * Edge validation for the obstacle-reading API. Bounds every field so malformed
 * or oversized payloads are rejected before any model call (Security signal).
 */
export const VisionRerouteRequestSchema = z.object({
  /** Base64 JPEG/PNG (no data: prefix). Capped to keep request size sane. */
  imageBase64: z.string().min(1).max(8_000_000),
  /** The graph node the fan is standing at / near the obstacle. */
  nearNodeId: z.string().min(1).max(64),
  profileId: z.enum(["wheelchair", "blind", "sensory", "standard"]),
  /** Which stadium graph to reroute within. */
  stadiumId: z.string().min(1).max(64).default("metlife"),
});

export type VisionRerouteRequest = z.infer<typeof VisionRerouteRequestSchema>;

const SeveritySchema = z.enum(["low", "medium", "high"]);

export const ObstacleInterpretationSchema = z.object({
  obstacleType: z.string(),
  severity: SeveritySchema,
  closedEdgeHint: z.string().nullable(),
  guidance: z.string(),
  source: z.enum(["gemini", "rules"]),
});

export type ObstacleInterpretation = z.infer<typeof ObstacleInterpretationSchema>;

const LocaleEnum = z.enum(["en", "es", "pt", "fr", "ar", "hi"]);

export const LocalizeRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  locale: LocaleEnum,
});
export type LocalizeRequest = z.infer<typeof LocalizeRequestSchema>;

export const HelpRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  locale: LocaleEnum,
});
export type HelpRequest = z.infer<typeof HelpRequestSchema>;

export const AskRequestSchema = z.object({
  query: z.string().min(1).max(500),
  stadiumId: z.string().min(1).max(64),
  locale: LocaleEnum,
});
export type AskRequest = z.infer<typeof AskRequestSchema>;
