"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { buildPlan } from "@/lib/concierge/planner";
import { PROFILES, type ProfileId } from "@/lib/routing/profiles";
import { profileLabel, renderPlanIntro, renderPlanStepDetail, renderPlanStepTitle, t } from "@/lib/i18n";
import { useApp } from "../../app-state";

const PROFILE_ORDER: readonly ProfileId[] = ["wheelchair", "blind", "sensory", "standard"];

export default function PlannerTool() {
  const { locale } = useApp();
  const [profileId, setProfileId] = useState<ProfileId>("wheelchair");
  const plan = buildPlan(profileId);
  const intro = renderPlanIntro(profileLabel(profileId, locale), plan.arriveMinutesEarly, locale);

  return (
    <div className="space-y-4">
      <fieldset className="card-surface p-3">
        <legend className="px-1 text-xs font-bold text-muted">{t("routingFor", locale)}</legend>
        <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {PROFILE_ORDER.map((id) => {
            const active = profileId === id;
            return (
              <label
                key={id}
                className={`cursor-pointer rounded-lg border px-2.5 py-2 text-center text-xs font-bold ${
                  active ? "border-accent bg-accent-weak text-accent" : "border-border text-muted hover:bg-surface-2"
                }`}
              >
                <input type="radio" name="plan-profile" checked={active} onChange={() => setProfileId(id)} className="sr-only" />
                {profileLabel(PROFILES[id].id, locale)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="card-surface p-4">
        <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-text">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          {intro}
        </p>
        <h2 className="mb-1 mt-4 text-xs font-black uppercase tracking-wider text-muted">{t("planHeading", locale)}</h2>
        <ol className="mt-3 space-y-3">
          {plan.steps.map((s) => (
            <li key={s.key} className="flex gap-3">
              <span className="w-16 shrink-0 text-right text-xs font-black text-accent">
                {s.offsetMin === 0 ? t("kickOff", locale) : `T-${s.offsetMin}m`}
              </span>
              <div className="border-l-2 border-border pl-3">
                <p className="text-sm font-bold text-text">{renderPlanStepTitle(s.key, locale)}</p>
                <p className="text-xs text-muted">{renderPlanStepDetail(s.key, plan.needsExtraTime, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
