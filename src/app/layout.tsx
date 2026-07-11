import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#4f46e5" };

export const metadata: Metadata = {
  metadataBase: new URL("https://atlas-access.web.app"),
  title: "AtlasAccess — Accessibility Dashboard | FIFA World Cup 2026",
  description:
    "A multilingual, accessibility-first dashboard for FIFA World Cup 2026 fans and staff: step-free wayfinding, venue Q&A, crowd intelligence and matchday planning on a deterministic engine, with an AI concierge powered by Gemini on Vertex AI.",
  applicationName: "AtlasAccess",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg" }],
  },
  openGraph: {
    title: "AtlasAccess — AI Accessibility Concierge for FIFA World Cup 2026",
    description:
      "Step-free wayfinding, venue Q&A, crowd intelligence and matchday planning in six languages, with a Gemini-powered concierge.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
