"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import { localizeClient } from "@/lib/concierge/localize-client";

/**
 * The optional AI assistant. This is the ONLY place AI is used in the app — the
 * four tools are fully deterministic. FAQ answers are translated via Gemini for
 * non-English locales; the free-form box asks /api/help. Rendered as a modal
 * right-side drawer with the native <dialog> focus trap + Escape handling.
 */
const FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is AtlasAccess?",
    a: "AtlasAccess is an accessibility-first companion for FIFA World Cup 2026. Use the tools for step-free routes, venue questions, crowds and matchday planning — this AI assistant is an optional extra.",
  },
  {
    q: "How do I get a step-free route to my seat?",
    a: "Open the Wayfinding tool, choose your access profile and destination, and it builds a step-free route on the map with directions you can read aloud.",
  },
  {
    q: "Which languages can I use?",
    a: "Six: English, Spanish, Portuguese, French, Arabic and Hindi. Switch the language from the top bar and every tool re-renders in your language instantly.",
  },
  {
    q: "Does it work without internet or an account?",
    a: "Yes. The tools run on a deterministic engine with no login required and work offline. This AI assistant adds richer phrasing when you're online.",
  },
  {
    q: "How do I change my stadium?",
    a: "Use the stadium button at the bottom of the sidebar to return to the welcome screen and pick a different venue.",
  },
];

export default function AiAssistant({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [faqAnswers, setFaqAnswers] = useState<Record<number, { text: string; ai: boolean }>>({});
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function toggleFaq(i: number, faqAnswer: string) {
    const isOpen = open === i;
    setOpen(isOpen ? null : i);
    if (!isOpen && !faqAnswers[i]) {
      void localizeClient(faqAnswer, locale).then((res) => setFaqAnswers((prev) => ({ ...prev, [i]: res })));
    }
  }

  async function ask() {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, locale }),
      });
      const data = (await res.json()) as { text: string; source: "grounded" | "gemini" };
      setAnswer(data.text);
      setAiPowered(data.source === "gemini");
    } catch {
      setAnswer("Sorry, I couldn't reach the assistant right now. Please try one of the questions above.");
      setAiPowered(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={t("assistantTitle", locale)}
      className="fixed right-0 top-0 m-0 h-dvh w-full max-w-md bg-transparent p-0 backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col border-l border-border bg-surface">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-text">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-weak text-accent">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              {t("assistantTitle", locale)}
            </h2>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted">{t("assistantIntro", locale)}</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t("close", locale)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t("commonQuestions", locale)}</p>
          <ul className="space-y-2">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <li key={faq.q} className="rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => toggleFaq(i, faq.a)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-sm font-bold text-text"
                  >
                    {faq.q}
                    <span className="text-muted" aria-hidden="true">
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5">
                      <p className="text-sm leading-relaxed text-text">{faqAnswers[i]?.text ?? faq.a}</p>
                      {faqAnswers[i]?.ai && (
                        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("translatedByGemini", locale)}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-border p-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {t("assistantAsk", locale)}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask();
            }}
            className="flex gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("assistantPlaceholder", locale)}
              aria-label={t("assistantAsk", locale)}
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label={t("askAi", locale)}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-[color:var(--accent-contrast)] hover:brightness-110 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          {answer && (
            <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-sm leading-relaxed text-text">{answer}</p>
              {aiPowered && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("answeredByGemini", locale)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
