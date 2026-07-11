"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MapPin, Search, Send, Sparkles } from "lucide-react";
import { getStadium } from "@/lib/stadiums";
import { t } from "@/lib/i18n";
import type { VenuePlace } from "@/lib/places";
import { useApp } from "../../app-state";
import { TOOLS, type ToolId } from "../tools-config";
import StadiumLocationMap from "../../StadiumLocationMap";
import VenueInfo from "../../VenueInfo";

export default function HomeView({ onNavigate }: { onNavigate: (id: ToolId) => void }) {
  const { stadiumId, locale } = useApp();
  const stadium = getStadium(stadiumId)!;
  const cards = TOOLS.filter((tl) => tl.id !== "home");
  const [venue, setVenue] = useState<VenuePlace | null>(null);

  // "Ask AtlasAccess" — GenAI front door on the primary screen.
  const [askQuery, setAskQuery] = useState("");
  const [ask, setAsk] = useState<{ answer: string; tool: ToolId; source: "gemini" | "grounded" } | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  async function runAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = askQuery.trim();
    if (!q || askLoading) return;
    setAskLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, stadiumId, locale }),
      });
      setAsk((await res.json()) as { answer: string; tool: ToolId; source: "gemini" | "grounded" });
    } catch {
      setAsk(null);
    } finally {
      setAskLoading(false);
    }
  }

  const askTool = ask ? TOOLS.find((tl) => tl.id === ask.tool) : undefined;

  // Prefer the real Google Places coordinates once resolved; fall back to built-in.
  const mapStadium = venue?.location ? { ...stadium, location: venue.location } : stadium;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent) 60%, #7c6cf0)" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-black/10" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> FIFA World Cup 2026
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">{t("heroTitle", locale)}</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{t("tagline", locale)}</p>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("wayfinding")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-accent shadow-sm hover:bg-white/90"
            >
              {t("heroCta", locale)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {stadium.name} · {stadium.city}
            </span>
          </div>
        </div>

        <div className="min-h-56">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted">{t("locationHeading", locale)}</p>
          <StadiumLocationMap stadium={mapStadium} />
        </div>
      </section>

      {/* Ask AtlasAccess — GenAI-powered natural-language front door */}
      <section className="card-surface p-5">
        <h2 className="flex items-center gap-2 text-sm font-black text-text">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-weak text-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          {t("askAi", locale)}
        </h2>
        <form onSubmit={runAsk} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder={t("assistantPlaceholder", locale)}
              aria-label={t("askAi", locale)}
              className="w-full rounded-xl border border-border bg-surface py-3 pe-3 ps-9 text-sm text-text placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={askLoading}
            aria-label={t("askAi", locale)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-[color:var(--accent-contrast)] hover:brightness-110 disabled:opacity-60"
          >
            {askLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        {ask && (
          <div aria-live="polite" className="mt-3 rounded-xl border border-border bg-surface-2 p-3.5">
            <p className="text-sm leading-relaxed text-text">{ask.answer}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ask.source === "gemini" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("answeredByGemini", locale)}
                </span>
              )}
              {askTool && (
                <button
                  type="button"
                  onClick={() => onNavigate(askTool.id)}
                  className="ms-auto inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[color:var(--accent-contrast)] hover:brightness-110"
                >
                  {t(askTool.labelKey, locale)}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Real venue data (Google Places when a key is configured) */}
      <VenueInfo stadiumId={stadiumId} locale={locale} onResolved={setVenue} />

      {/* Tool cards */}
      <section>
        <h2 className="mb-3 text-sm font-black text-text">{t("overviewChoose", locale)}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onNavigate(tool.id)}
                className="card-surface group flex items-start gap-3 p-4 text-left transition hover:ring-1 hover:ring-accent/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-weak text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-black text-text">
                    {t(tool.labelKey, locale)}
                    <ArrowRight className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{t(tool.descKey, locale)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
