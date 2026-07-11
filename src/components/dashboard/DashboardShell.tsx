"use client";

import { useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { useApp } from "../app-state";
import { getStadium } from "@/lib/stadiums";
import { LOCALES, isRtl, t, type Locale } from "@/lib/i18n";
import Sidebar from "./Sidebar";
import { TOOLS, type ToolId } from "./tools-config";
import HomeView from "./tools/HomeView";
import WayfindingTool from "./tools/WayfindingTool";
import CrowdTool from "./tools/CrowdTool";
import QaTool from "./tools/QaTool";
import PlannerTool from "./tools/PlannerTool";
import AiAssistant from "../assistant/AiAssistant";

export default function DashboardShell() {
  const { stadiumId, locale, setLocale, changeStadium } = useApp();
  const stadium = getStadium(stadiumId);
  const [active, setActive] = useState<ToolId>("home");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!stadium) return null;

  const dir = isRtl(locale) ? "rtl" : "ltr";
  const meta = TOOLS.find((tl) => tl.id === active)!;

  function select(id: ToolId) {
    setActive(id);
    setDrawerOpen(false);
  }

  return (
    <div dir={dir} className="flex min-h-dvh">
      {/* Desktop sidebar rail */}
      <aside className="hidden w-64 shrink-0 border-e border-border bg-surface md:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar active={active} onSelect={select} stadium={stadium} onChangeStadium={changeStadium} locale={locale} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={t("close", locale)}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 start-0 w-72 border-e border-border bg-surface">
            <Sidebar
              active={active}
              onSelect={select}
              stadium={stadium}
              onChangeStadium={changeStadium}
              locale={locale}
              onCloseDrawer={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("menu", locale)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-black text-text">{t(meta.labelKey, locale)}</h1>
            <p className="truncate text-xs text-muted">{t(meta.descKey, locale)}</p>
          </div>

          <label className="sr-only" htmlFor="lang-select">
            {t("onboardLanguage", locale)}
          </label>
          <select
            id="lang-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-text"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </header>

        <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
          {active === "home" && <HomeView onNavigate={select} />}
          {active === "wayfinding" && <WayfindingTool />}
          {active === "crowd" && <CrowdTool />}
          {active === "qa" && <QaTool onOpenAssistant={() => setAssistantOpen(true)} />}
          {active === "planner" && <PlannerTool />}
        </main>
      </div>

      {/* Floating AI assistant entry — optional helper, never on the critical path */}
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 z-30 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-[color:var(--accent-contrast)] shadow-lg shadow-accent/25 hover:brightness-110 end-6"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" /> {t("askAi", locale)}
      </button>

      {assistantOpen && <AiAssistant locale={locale} onClose={() => setAssistantOpen(false)} />}
    </div>
  );
}
