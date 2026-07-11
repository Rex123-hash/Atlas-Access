"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { Stadium } from "@/lib/stadiums";

/**
 * Real-world location map for the selected stadium. Uses Leaflet with free
 * OpenStreetMap tiles (no API key). If a public Mapbox token is provided via
 * NEXT_PUBLIC_MAPBOX_TOKEN, nicer Mapbox tiles are used instead. Degrades
 * gracefully to a static card if the map library or tiles cannot load (e.g.
 * offline) — the deterministic indoor route remains the source of truth.
 */
export default function StadiumLocationMap({ stadium }: { stadium: Stadium }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const loc = stadium.location;
    if (!loc) return;

    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    void (async () => {
      try {
        const L = await import("leaflet");
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          center: [loc.lat, loc.lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true,
        });

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (token) {
          L.tileLayer(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${token}`,
            { maxZoom: 19, tileSize: 512, zoomOffset: -1, attribution: "© Mapbox © OpenStreetMap" },
          ).addTo(map);
        } else {
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);
        }

        const icon = L.divIcon({ className: "", html: '<div class="atlas-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
        L.marker([loc.lat, loc.lng], { icon, title: stadium.name, keyboard: false }).addTo(map);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // Depend on primitive location + name so a fresh stadium object with the
    // same coordinates does not needlessly re-initialize the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stadium.location?.lat, stadium.location?.lng, stadium.name]);

  if (failed || !stadium.location) {
    return (
      <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface-2 p-6 text-center">
        <MapPin className="h-6 w-6 text-accent" aria-hidden="true" />
        <p className="text-sm font-bold text-text">{stadium.name}</p>
        <p className="text-xs text-muted">
          {stadium.city} · {stadium.countryCode}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Map showing the location of ${stadium.name} in ${stadium.city}`}
      className="h-full min-h-56 w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}
