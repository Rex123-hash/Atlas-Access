"use client";

import { useEffect, useState } from "react";
import { Accessibility, Check, MapPin, Minus, Sparkles, Star } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import type { VenuePlace } from "@/lib/places";

/**
 * Real venue information card. Fetches /api/venue, which returns live Google
 * Places data when a GOOGLE_MAPS_API_KEY is configured, or built-in fallback
 * data otherwise. The source is shown honestly (live vs. sample).
 */
export default function VenueInfo({
  stadiumId,
  locale,
  onResolved,
}: {
  stadiumId: string;
  locale: Locale;
  onResolved?: (place: VenuePlace) => void;
}) {
  const [place, setPlace] = useState<VenuePlace | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/venue?stadium=${encodeURIComponent(stadiumId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<VenuePlace>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        setPlace(data);
        onResolved?.(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // onResolved intentionally omitted: callers pass a stable/inline handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stadiumId]);

  if (!place) return null;

  const live = place.source === "google";
  const ac = place.accessibility;

  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-black text-text">
            <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            {place.name}
          </p>
          {place.address && <p className="mt-0.5 text-xs text-muted">{place.address}</p>}
          {place.rating != null && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-text">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden="true" /> {place.rating.toFixed(1)}
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            live ? "bg-accent-weak text-accent" : "bg-surface-2 text-muted"
          }`}
        >
          {live ? <Sparkles className="h-3 w-3" aria-hidden="true" /> : null}
          {live ? t("liveFromGoogle", locale) : t("modelledData", locale)}
        </span>
      </div>

      {ac && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
            <Accessibility className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {t("accessibilityAtVenue", locale)}
          </p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <AcRow label={t("acEntrance", locale)} value={ac.wheelchairAccessibleEntrance} locale={locale} />
            <AcRow label={t("acParking", locale)} value={ac.wheelchairAccessibleParking} locale={locale} />
            <AcRow label={t("acRestroom", locale)} value={ac.wheelchairAccessibleRestroom} locale={locale} />
            <AcRow label={t("acSeating", locale)} value={ac.wheelchairAccessibleSeating} locale={locale} />
          </ul>
        </div>
      )}
    </div>
  );
}

function AcRow({ label, value, locale }: { label: string; value: boolean | null; locale: Locale }) {
  const text = value === null ? t("notListed", locale) : value ? t("yes", locale) : t("no", locale);
  const Icon = value ? Check : Minus;
  const tone = value ? "text-emerald-600" : value === false ? "text-danger" : "text-muted";
  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <span className="text-text">{label}</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${tone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {text}
      </span>
    </li>
  );
}
