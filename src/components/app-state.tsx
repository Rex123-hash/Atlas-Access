"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isLocale, type Locale } from "@/lib/i18n";
import { DEFAULT_STADIUM_ID, getStadium } from "@/lib/stadiums";

interface AppState {
  readonly onboarded: boolean;
  readonly stadiumId: string;
  readonly locale: Locale;
}

interface AppContextValue extends AppState {
  readonly ready: boolean;
  setStadium: (id: string) => void;
  setLocale: (l: Locale) => void;
  completeOnboarding: () => void;
  changeStadium: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = "atlasaccess.v1";
const INITIAL: AppState = { onboarded: false, stadiumId: DEFAULT_STADIUM_ID, locale: "en" };

function readStored(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const saved = JSON.parse(raw) as Partial<AppState> & { locale?: string };
    return {
      onboarded: saved.onboarded === true,
      stadiumId: saved.stadiumId && getStadium(saved.stadiumId)?.available ? saved.stadiumId : INITIAL.stadiumId,
      locale: saved.locale && isLocale(saved.locale) ? saved.locale : INITIAL.locale,
    };
  } catch {
    return INITIAL;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(INITIAL);

  // Hydrate from storage after first paint (deferred off the effect body so
  // SSR output stays stable and there is no cascading-render).
  useEffect(() => {
    void Promise.resolve().then(() => {
      setState(readStored());
      setReady(true);
    });
  }, []);

  // Persist whenever a choice changes (localStorage is an external system).
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value: AppContextValue = {
    ...state,
    ready,
    setStadium: (id) => setState((s) => ({ ...s, stadiumId: id })),
    setLocale: (l) => setState((s) => ({ ...s, locale: l })),
    completeOnboarding: () => setState((s) => ({ ...s, onboarded: true })),
    changeStadium: () => setState((s) => ({ ...s, onboarded: false })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
