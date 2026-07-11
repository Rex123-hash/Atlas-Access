import type { VenueGraph } from "./graph/types";
import { interpretObstacleWithRules } from "./rules-fallback";
import type { ObstacleInterpretation, VisionRerouteRequest } from "./schemas";

/**
 * Gemini multimodal obstacle reader with graceful degradation.
 *
 * Split of responsibility (deliberate):
 *   • Gemini PERCEIVES — "is this a broken lift, a blocked ramp, a crowd wall?"
 *     and phrases fan-friendly guidance from the camera image.
 *   • The deterministic rules engine DECIDES the graph action (which passage to
 *     close), because rerouting a blind/wheelchair fan is safety-critical.
 *
 * The public entry point never throws: any failure (disabled, missing creds,
 * network/quota, malformed output) falls back to the pure rules interpretation.
 * Authentication is ADC on Vertex (no key in the repo) or an API key locally.
 */

export interface GeminiSettings {
  readonly useGemini: boolean;
  readonly useVertex: boolean;
  readonly apiKey: string | undefined;
  readonly project: string | undefined;
  readonly location: string;
  readonly model: string;
}

export function readGeminiSettings(env: NodeJS.ProcessEnv = process.env): GeminiSettings {
  return {
    useGemini: env.USE_GEMINI === "true",
    useVertex: env.USE_VERTEX === "true",
    apiKey: env.GEMINI_API_KEY,
    project: env.GOOGLE_CLOUD_PROJECT,
    location: env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    model: env.GEMINI_MODEL ?? "gemini-2.5-flash",
  };
}

const SYSTEM_INSTRUCTION =
  "You help disabled fans navigate a stadium. Given a photo taken by a fan at a " +
  "passage, classify what is blocking or affecting it and write one short, calm, " +
  "reassuring sentence of guidance. Never invent hazards you cannot see.";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    obstacleType: { type: "string" },
    severity: { type: "string", enum: ["low", "medium", "high"] },
    guidance: { type: "string" },
  },
  required: ["obstacleType", "severity", "guidance"],
} as const;

export async function interpretObstacle(
  graph: VenueGraph,
  input: VisionRerouteRequest,
  settings: GeminiSettings = readGeminiSettings(),
): Promise<ObstacleInterpretation> {
  // Deterministic decision (which passage to close) is computed regardless.
  const base = interpretObstacleWithRules(graph, input.nearNodeId);
  if (!settings.useGemini) return base;

  try {
    const perceived = await callGemini(input, settings);
    return {
      obstacleType: perceived.obstacleType,
      severity: perceived.severity,
      guidance: perceived.guidance,
      closedEdgeHint: base.closedEdgeHint, // graph action stays deterministic
      source: "gemini",
    };
  } catch {
    return base;
  }
}

interface PerceivedObstacle {
  obstacleType: string;
  severity: "low" | "medium" | "high";
  guidance: string;
}

/** Lazily imports the SDK so local/CI paths need no credentials or package. */
async function callGemini(
  input: VisionRerouteRequest,
  settings: GeminiSettings,
): Promise<PerceivedObstacle> {
  const { GoogleGenAI } = await import("@google/genai");

  const ai = settings.useVertex
    ? new GoogleGenAI({ vertexai: true, project: settings.project, location: settings.location })
    : new GoogleGenAI({ apiKey: settings.apiKey });

  const response = await ai.models.generateContent({
    model: settings.model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: input.imageBase64 } },
          { text: `The fan uses the "${input.profileId}" accessibility profile. What is affecting this passage?` },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  });

  const parsed = JSON.parse(response.text ?? "") as PerceivedObstacle;
  if (!parsed.guidance || !parsed.obstacleType) {
    throw new Error("Gemini returned an incomplete interpretation");
  }
  return parsed;
}
