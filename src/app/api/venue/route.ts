import { NextResponse } from "next/server";
import { getStadium } from "@/lib/stadiums";
import { builtinVenuePlace, fetchVenuePlace, readMapsKey } from "@/lib/places";

/**
 * GET /api/venue?stadium=<id> — real venue data from Google Places when a
 * GOOGLE_MAPS_API_KEY is configured, else the built-in fallback. Never throws;
 * always returns a usable VenuePlace so the UI renders with or without a key.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const id = new URL(request.url).searchParams.get("stadium") ?? "";
  const stadium = getStadium(id);
  if (!stadium) return NextResponse.json({ error: "Unknown stadium." }, { status: 404 });

  const key = readMapsKey();
  if (!key) return NextResponse.json(builtinVenuePlace(stadium));

  try {
    return NextResponse.json(await fetchVenuePlace(stadium, key));
  } catch {
    return NextResponse.json(builtinVenuePlace(stadium));
  }
}
