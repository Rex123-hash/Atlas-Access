import type { ProfileId } from "../routing/profiles";
import type { PlanStepKey } from "../i18n/templates";

export interface PlanStep {
  /** Minutes before kick-off (0 = kick-off). */
  readonly offsetMin: number;
  readonly title: string;
  readonly detail: string;
  /** Stable key for deterministic localization of title/detail. */
  readonly key: PlanStepKey;
}

export interface MatchPlan {
  readonly arriveMinutesEarly: number;
  /** Whether this profile is advised to arrive earlier (drives copy variants). */
  readonly needsExtraTime: boolean;
  readonly steps: readonly PlanStep[];
}

/**
 * Deterministic matchday timeline. Fans who need step-free access or a calmer
 * experience are advised to arrive earlier (priority lanes, extra transit time).
 */
export function buildPlan(profileId: ProfileId): MatchPlan {
  const needsExtraTime = profileId !== "standard";
  const arrive = needsExtraTime ? 120 : 75;

  const steps: PlanStep[] = [
    {
      offsetMin: arrive,
      key: "setOff",
      title: "Set off for the stadium",
      detail: needsExtraTime
        ? "Allow extra time for step-free transit and priority security lanes."
        : "Leave early to beat the queues at security.",
    },
    {
      offsetMin: arrive - 25,
      key: "arrive",
      title: "Arrive at your accessible entrance",
      detail: "Use the step-free entrance and the priority lane for disabled fans.",
    },
    {
      offsetMin: arrive - 55,
      key: "bearings",
      title: "Get your bearings",
      detail: needsExtraTime
        ? "Locate the nearest accessible restroom and the quiet room before the crowds build."
        : "Grab refreshments before the concourse fills up.",
    },
    {
      offsetMin: 15,
      key: "toSeat",
      title: "Head to your seat",
      detail: "Give yourself around 15 minutes to reach your section calmly.",
    },
    { offsetMin: 0, key: "kickoff", title: "Kick-off", detail: "Enjoy the match." },
  ];

  return { arriveMinutesEarly: arrive, needsExtraTime, steps };
}
