import "server-only";

import { normalisePostcode } from "@/lib/postcode";

// Free postcode → nearby streets / houses lookup, for the checkout address
// type-ahead. postcodes.io gives the postcode's centre; OpenStreetMap
// (Overpass) gives the named streets and any mapped house numbers around it.
// OSM has street names almost everywhere but house numbers only patchily, so
// the client builds "{number} {street}" suggestions from the street list.
// A paid Royal Mail (PAF) provider could replace this later behind the same shape.

export type AddressLookup = {
  postcode: string;
  /** Postcode centre — the client limits its typed-text search to a box around it. */
  lat: number;
  lon: number;
  town: string | null;
  /** Named streets around the postcode, nearest first. */
  streets: string[];
  /** Mapped addresses ("47 Edgbaston Park Road"), this postcode's first. */
  houses: { line1: string; street: string }[];
};

const USER_AGENT = "OcunioEnergy/1.0 (info@ocunioenergy.com)";
const STREET_RADIUS_M = 250;
const HOUSE_RADIUS_M = 150;
const OVERPASS_MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const WEEK = 7 * 24 * 60 * 60;

// Small per-server cache — a postcode is looked up once a week at most.
const cache = new Map<string, { at: number; value: AddressLookup }>();
const CACHE_MAX = 500;

export function cachedLookup(postcode: string): AddressLookup | null {
  const hit = cache.get(normalisePostcode(postcode));
  return hit && Date.now() - hit.at < WEEK * 1000 ? hit.value : null;
}

function remember(value: AddressLookup) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(value.postcode, { at: Date.now(), value });
}

async function getJson<T>(url: string, init?: RequestInit, timeoutMs = 6000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "User-Agent": USER_AGENT, ...init?.headers },
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: WEEK },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type OverpassElement = {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const STREET_HIGHWAYS = /^(residential|living_street|unclassified|tertiary|secondary|primary|trunk|service|road|pedestrian)$/;

function distance(aLat: number, aLon: number, bLat: number, bLon: number) {
  const x = (bLon - aLon) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  const y = bLat - aLat;
  return x * x + y * y;
}

/** Overpass first (streets + houses); Nominatim reverse as a last resort (nearest street). */
export async function lookupPostcode(raw: string): Promise<AddressLookup | null> {
  const postcode = normalisePostcode(raw);
  const cached = cachedLookup(postcode);
  if (cached) return cached;

  const pc = await getJson<{ result?: { latitude: number | null; longitude: number | null; admin_district?: string | null; postcode: string } }>(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
  );
  const lat = pc?.result?.latitude;
  const lon = pc?.result?.longitude;
  if (!pc?.result || lat == null || lon == null) return null;
  const canonical = pc.result.postcode;
  const district = pc.result.admin_district ?? null;

  // Streets (light, essential) and house numbers (heavy in dense areas, a bonus)
  // are separate queries run in parallel; the street query races two mirrors.
  const overpass = (mirror: string, query: string, timeoutMs: number) =>
    getJson<{ elements: OverpassElement[] }>(
      mirror,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }).toString(),
      },
      timeoutMs,
    ).then((data) => {
      if (!data?.elements) throw new Error("overpass failed");
      return data.elements;
    });
  const streetQuery = `[out:json][timeout:8];way(around:${STREET_RADIUS_M},${lat},${lon})[highway][name];out tags center;`;
  const houseQuery = `[out:json][timeout:6];nwr(around:${HOUSE_RADIUS_M},${lat},${lon})["addr:housenumber"];out tags center;`;
  const [streetEls, houseEls] = await Promise.all([
    Promise.any(OVERPASS_MIRRORS.map((m) => overpass(m, streetQuery, 9000))).catch(() => null),
    overpass(OVERPASS_MIRRORS[0], houseQuery, 7000).catch(() => [] as OverpassElement[]),
  ]);
  const elements = streetEls ? [...streetEls, ...houseEls] : null;

  let result: AddressLookup;
  if (elements) {
    const streetDist = new Map<string, number>();
    const houses: { line1: string; street: string; samePostcode: boolean; d: number }[] = [];
    const cities = new Map<string, number>();
    const compact = canonical.replace(/\s/g, "");
    for (const el of elements) {
      const tags = el.tags ?? {};
      const eLat = el.lat ?? el.center?.lat ?? lat;
      const eLon = el.lon ?? el.center?.lon ?? lon;
      const d = distance(lat, lon, eLat, eLon);
      if (tags.highway && tags.name && STREET_HIGHWAYS.test(tags.highway)) {
        streetDist.set(tags.name, Math.min(streetDist.get(tags.name) ?? Infinity, d));
      }
      const number = tags["addr:housenumber"];
      const street = tags["addr:street"];
      if (number && street) {
        const name = tags["addr:housename"];
        houses.push({
          line1: name && !/^\d/.test(number) ? `${name}, ${number} ${street}` : `${number} ${street}`,
          street,
          samePostcode: (tags["addr:postcode"] ?? "").replace(/\s/g, "").toUpperCase() === compact,
          d,
        });
        if (!streetDist.has(street)) streetDist.set(street, d);
      }
      const city = tags["addr:city"];
      if (city) cities.set(city, (cities.get(city) ?? 0) + 1);
    }
    const seen = new Set<string>();
    result = {
      postcode: canonical,
      lat,
      lon,
      town: [...cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? district,
      streets: [...streetDist.entries()].sort((a, b) => a[1] - b[1]).slice(0, 25).map(([s]) => s),
      houses: houses
        .sort((a, b) => Number(b.samePostcode) - Number(a.samePostcode) || a.d - b.d)
        .filter((h) => !seen.has(h.line1) && seen.add(h.line1))
        .slice(0, 300)
        .map(({ line1, street }) => ({ line1, street })),
    };
  } else {
    // Overpass down — the nearest street and town are still useful.
    const rev = await getJson<{ address?: { road?: string; town?: string; city?: string; village?: string; suburb?: string } }>(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&addressdetails=1&lat=${lat}&lon=${lon}`,
    );
    const a = rev?.address;
    return {
      // Not cached: a later request may reach Overpass and get the full list.
      postcode: canonical,
      lat,
      lon,
      town: a?.town ?? a?.city ?? a?.village ?? district,
      streets: a?.road ? [a.road] : [],
      houses: [],
    };
  }

  remember(result);
  return result;
}
