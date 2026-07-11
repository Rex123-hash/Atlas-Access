"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { getStadium, type FactCategory } from "@/lib/stadiums";
import { answerQuestion } from "@/lib/concierge/qa";
import { factCategoryLabel, t } from "@/lib/i18n";
import { useApp } from "../../app-state";

interface Props {
  readonly onOpenAssistant: () => void;
}

interface Answer {
  readonly text: string;
  readonly matched: boolean;
  readonly category: FactCategory | null;
}

export default function QaTool({ onOpenAssistant }: Props) {
  const { stadiumId, locale } = useApp();
  const stadium = getStadium(stadiumId)!;
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);

  function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const r = answerQuestion(trimmed, stadium, locale);
    setAnswer({ text: r.answer, matched: r.matched, category: r.category });
  }

  function pickFact(category: FactCategory) {
    const fact = stadium.facts.find((f) => f.category === category);
    if (!fact) return;
    setQuery(factCategoryLabel(category, locale));
    setAnswer({ text: fact.answer[locale] ?? fact.answer.en, matched: true, category });
  }

  return (
    <div className="space-y-4">
      <div className="card-surface p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("qaPlaceholder", locale)}
              aria-label={t("qaPlaceholder", locale)}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-[color:var(--accent-contrast)] hover:brightness-110"
          >
            {t("qaAsk", locale)}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {stadium.facts.map((f) => {
            const active = answer?.category === f.category;
            return (
              <button
                key={f.category}
                type="button"
                onClick={() => pickFact(f.category)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  active ? "border-accent bg-accent-weak text-accent" : "border-border text-muted hover:border-accent/40 hover:text-text"
                }`}
              >
                {factCategoryLabel(f.category, locale)}
              </button>
            );
          })}
        </div>
      </div>

      {answer && (
        <div className="card-surface p-4">
          <p className="text-sm font-medium leading-relaxed text-text">{answer.text}</p>
          {!answer.matched && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-weak px-3 py-1.5 text-xs font-bold text-accent hover:brightness-105"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {t("qaTryAi", locale)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
