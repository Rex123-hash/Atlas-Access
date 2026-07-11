"use client";

import { useMemo, useState } from "react";
import { Camera, RotateCcw, Sparkles, Volume2, Zap } from "lucide-react";
import { findRoute } from "@/lib/routing/astar";
import { PROFILES, type ProfileId } from "@/lib/routing/profiles";
import { getNode } from "@/lib/graph/venue";
import { getStadium } from "@/lib/stadiums";
import { useApp } from "../../app-state";
import type { ObstacleInterpretation } from "@/lib/schemas";
import { profileLabel, renderRouteReason, renderRouteStep, t } from "@/lib/i18n";
import { speak } from "@/lib/tts";
import VenueMap from "../../VenueMap";
import StadiumLocationMap from "../../StadiumLocationMap";

const PROFILE_ORDER: readonly ProfileId[] = ["wheelchair", "blind", "sensory", "standard"];
const NO_CLOSED_NODES = { closedNodeIds: new Set<string>() };

export default function WayfindingTool() {
  const { stadiumId, locale } = useApp();
  const stadium = getStadium(stadiumId)!;
  const firstDest = stadium.destinations[0] ?? stadium.entranceId;

  const [profileId, setProfileId] = useState<ProfileId>("wheelchair");
  const [destination, setDestination] = useState<string>(firstDest);
  const [closedEdgeIds, setClosedEdgeIds] = useState<ReadonlySet<string>>(new Set());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const liftEdge = useMemo(() => stadium.graph.edges.find((e) => e.features.lift), [stadium]);
  const obstacleNode = liftEdge?.from ?? stadium.entranceId;

  const route = useMemo(
    () => findRoute(stadium.graph, stadium.entranceId, destination, PROFILES[profileId], { closedEdgeIds, ...NO_CLOSED_NODES }),
    [stadium, destination, profileId, closedEdgeIds],
  );

  const reasonText = route.reasonInfo ? renderRouteReason(route.reasonInfo, locale) : t("noRoute", locale);
  const stepTexts = route.steps.map((s) => renderRouteStep(s.move, locale));
  const spoken = `${reasonText} ${stepTexts.join(" ")}`.trim();
  const destinationOptions = stadium.destinations.map((id) => ({ id, label: getNode(stadium.graph, id)?.label ?? id }));

  function simulateOutage() {
    if (!liftEdge) return;
    setClosedEdgeIds(new Set([...closedEdgeIds, liftEdge.id]));
    setStatus(t("simulateOutage", locale));
  }
  function clearClosures() {
    setClosedEdgeIds(new Set());
    setStatus("");
  }

  async function onScan(file: File) {
    setBusy(true);
    setStatus(t("scanning", locale));
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/vision-reroute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, nearNodeId: obstacleNode, profileId, stadiumId: stadium.id }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: ObstacleInterpretation = await res.json();
      if (data.closedEdgeHint) setClosedEdgeIds(new Set([...closedEdgeIds, data.closedEdgeHint]));
      setStatus(data.guidance);
    } catch {
      setStatus("Couldn't read the obstacle. Please try again or ask a steward.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="card-surface p-3">
          <legend className="px-1 text-xs font-bold text-muted">{t("routingFor", locale)}</legend>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {PROFILE_ORDER.map((id) => {
              const active = profileId === id;
              return (
                <label
                  key={id}
                  className={`cursor-pointer rounded-lg border px-2.5 py-2 text-xs font-bold ${
                    active ? "border-accent bg-accent-weak text-accent" : "border-border text-muted hover:bg-surface-2"
                  }`}
                >
                  <input type="radio" name="wf-profile" checked={active} onChange={() => setProfileId(id)} className="sr-only" />
                  {profileLabel(id, locale)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="card-surface p-3">
          <label htmlFor="wf-dest" className="px-1 text-xs font-bold text-muted">
            {t("destination", locale)}
          </label>
          <select
            id="wf-dest"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-text"
          >
            {destinationOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted">{t("locationHeading", locale)}</p>
          <StadiumLocationMap stadium={stadium} />
        </div>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted">{t("indoorRouteHeading", locale)}</p>
          <VenueMap graph={stadium.graph} path={route.path} closedEdgeIds={closedEdgeIds} />
          <p className="mt-1.5 text-[11px] italic text-muted">{t("illustrativeModel", locale)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => speak(spoken)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold hover:bg-surface-2"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" /> {t("speakRoute", locale)}
        </button>
        {liftEdge && (
          <button
            type="button"
            onClick={simulateOutage}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold hover:bg-surface-2"
          >
            <Zap className="h-4 w-4" aria-hidden="true" /> {t("simulateOutage", locale)}
          </button>
        )}
        <label
          title={t("scanHint", locale)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-accent/40 bg-accent-weak px-3.5 py-2 text-xs font-bold text-accent hover:brightness-105"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {busy ? t("scanning", locale) : t("scanObstacle", locale)}
          <span className="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[color:var(--accent-contrast)]">
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> {t("aiBadge", locale)}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onScan(file);
              e.target.value = "";
            }}
          />
        </label>
        {closedEdgeIds.size > 0 && (
          <button
            type="button"
            onClick={clearClosures}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold hover:bg-surface-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t("clear", locale)}
          </button>
        )}
      </div>

      {status && (
        <p aria-live="polite" className="text-sm font-medium text-accent">
          {status}
        </p>
      )}

      <div aria-live="assertive" className="card-surface p-4">
        {route.found && (
          <div className="mb-3 flex gap-6">
            <Stat label={t("distance", locale)} value={`${route.totalDistanceMeters} m`} />
            <Stat label={t("steps", locale)} value={String(route.steps.length - 1)} />
          </div>
        )}
        <p className="text-sm font-medium leading-relaxed text-text">{reasonText}</p>
        {route.found && (
          <ol className="mt-3 space-y-1.5">
            {route.steps.map((step, i) => (
              <li key={step.nodeId} className="flex items-center gap-3 text-sm text-text">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-weak text-[10px] font-bold text-accent">
                  {i + 1}
                </span>
                {stepTexts[i]}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-black text-text">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return reject(new Error("read failed"));
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}
