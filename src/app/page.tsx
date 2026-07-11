import { AppProvider } from "@/components/app-state";
import AppShell from "@/components/AppShell";

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
