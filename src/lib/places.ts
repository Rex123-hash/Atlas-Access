import type { Stadium } from "./stadiums";

/**
 * Real venue data via the Google Places API (New). This replaces hand-authored
 * location/accessibility data with live data for the "up to the gate" layer.
 * The API key is read server-side only (never shipped to the browser) and the
 * app degrades gracefully to built-in data when no key is configured or the
 * request fails — so it always renders.
 *
 * Indoor step-free routing, wheelchair-bay layouts and live crowd have NO public
 * API (venue-private data) and remain an illustrative model — see the UI label.
 */

export interface VenueAccessibility {
  readonly wheelchairAccessibleEntrance: boolean | null;
  readonly wheelchairAccessibleParking: boolean | null;
  readonly wheelchairAccessibleRestroom: boolean | null;
  readonly wheelchairAccessibleSeating: boolean | null;
}

export interface VenuePlace {
  /** Whether this came from Google Places ("google") or the built-in fallback. */
  readonly source: "google" | "builtin";
  readonly name: string;
  readonly address: string | null;
  readonly location: { lat: number; lng: number } | null;
  readonly rating: number | null;
  readonly mapsUri: string | null;
  readonly accessibility: VenueAccessibility | null;
}

export function readMapsKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.GOOGLE_MAPS_API_KEY || undefined;
}

/** Built-in fallback derived from the bundled stadium record (no network). */
export function builtinVenuePlace(stadium: Stadium): VenuePlace {
  return {
    source: "builtin",
    name: stadium.name,
    address: `${stadium.city}, ${stadium.country}`,
    location: stadium.location ?? null,
    rating: null,
    mapsUri: null,
    accessibility: null,
  };
}

interface PlacesResponse {
  places?: Array<{
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    googleMapsUri?: string;
    accessibilityOptions?: Partial<VenueAccessibility>;
  }>;
}

/** Resolve a stadium to real Google Places data. Throws on any failure so the
 * caller can fall back to {@link builtinVenuePlace}. */
export async function fetchVenuePlace(stadium: Stadium, key: string): Promise<VenuePlace> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.rating,places.googleMapsUri,places.accessibilityOptions",
    },
    body: JSON.stringify({ textQuery: `${stadium.name}, ${stadium.city}`, maxResultCount: 1 }),
    // Places data changes slowly; cache for a day to stay within quota.
    next: { revalidate: 86_400 },
  });

  if (!res.ok) throw new Error(`Places API ${res.status}`);
  const data = (await res.json()) as PlacesResponse;
  const p = data.places?.[0];
  if (!p) throw new Error("No place match");

  const a = p.accessibilityOptions ?? {};
  const loc = p.location;
  return {
    source: "google",
    name: p.displayName?.text ?? stadium.name,
    address: p.formattedAddress ?? null,
    location: loc?.latitude != null && loc?.longitude != null ? { lat: loc.latitude, lng: loc.longitude } : null,
    rating: p.rating ?? null,
    mapsUri: p.googleMapsUri ?? null,
    accessibility: {
      wheelchairAccessibleEntrance: a.wheelchairAccessibleEntrance ?? null,
      wheelchairAccessibleParking: a.wheelchairAccessibleParking ?? null,
      wheelchairAccessibleRestroom: a.wheelchairAccessibleRestroom ?? null,
      wheelchairAccessibleSeating: a.wheelchairAccessibleSeating ?? null,
    },
  };
}
