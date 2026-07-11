import { Clock, Home, MapPin, MessageCircleQuestion, Users } from "lucide-react";
import type { MessageKey } from "@/lib/i18n";

export type ToolId = "home" | "wayfinding" | "crowd" | "qa" | "planner";

export interface ToolMeta {
  readonly id: ToolId;
  readonly icon: typeof MapPin;
  readonly labelKey: MessageKey;
  readonly descKey: MessageKey;
}

/** The dashboard tool registry. Kept in a plain module (not a component file) so
 * component files export only components. */
export const TOOLS: readonly ToolMeta[] = [
  { id: "home", icon: Home, labelKey: "home", descKey: "toolHomeDesc" },
  { id: "wayfinding", icon: MapPin, labelKey: "capWayfinding", descKey: "toolWayfindingDesc" },
  { id: "crowd", icon: Users, labelKey: "capCrowd", descKey: "toolCrowdDesc" },
  { id: "qa", icon: MessageCircleQuestion, labelKey: "capAnnounce", descKey: "toolQaDesc" },
  { id: "planner", icon: Clock, labelKey: "capPlanner", descKey: "toolPlannerDesc" },
];
