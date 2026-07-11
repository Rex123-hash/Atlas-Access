"use client";

import { ArrowRight, Check, MapPin, Navigation } from "lucide-react";
import { useApp } from "../app-state";
import { STADIUMS } from "@/lib/stadiums";
import { LOCALES, t, type Locale } from "@/lib/i18n";

/** Welcome / onboarding: pick a stadium and language before entering the app. */
export default function Onboarding() {
  const { stadiumId, locale, setStadium, setLocale, completeOnboarding } = useApp();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-weak px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> FIFA World Cup 2026
        </span>
        <h1 className="mt-3 flex items-center gap-2.5 text-4xl font-black tracking-tight text-text">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-[color:var(--accent-contrast)]">
            <Navigation className="h-6 w-6" aria-hidden="true" />
          </span>
          {t("onboardTitle", locale)}
        </h1>
        <p className="mt-3 text-sm text-muted">{t("tagline", locale)}</p>
      </div>

      <h2 className="mb-3 text-sm font-bold text-text">{t("onboardStadium", locale)}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {STADIUMS.map((s) => {
          const active = stadiumId === s.id;
          const disabled = !s.available;
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => setStadium(s.id)}
              aria-pressed={active}
              className={`card-surface flex items-start justify-between gap-3 p-4 text-left transition ${
                active ? "ring-2 ring-accent" : ""
              } ${disabled ? "cursor-not-allowed opacity-60" : "hover:ring-1 hover:ring-accent/40"}`}
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-black text-text">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  {s.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {s.city} · {s.countryCode}
                </p>
                {disabled && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">{t("comingSoon", locale)}</p>}
              </div>
              {active && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[color:var(--accent-contrast)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="ob-lang" className="mb-2 block text-sm font-bold text-text">
          {t("onboardLanguage", locale)}
        </label>
        <select
          id="ob-lang"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={completeOnboarding}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-black text-[color:var(--accent-contrast)] hover:brightness-110"
      >
        {t("continue", locale)}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </main>
  );
}
