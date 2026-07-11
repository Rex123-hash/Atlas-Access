"use client";

import { useApp } from "./app-state";
import Onboarding from "./onboarding/Onboarding";
import DashboardShell from "./dashboard/DashboardShell";

export default function AppShell() {
  const { ready, onboarded } = useApp();

  // Avoid a hydration flash before persisted state is read.
  if (!ready) return <main className="min-h-screen" aria-busy="true" />;

  return onboarded ? <DashboardShell /> : <Onboarding />;
}
