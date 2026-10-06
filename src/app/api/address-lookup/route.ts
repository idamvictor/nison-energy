import { NextResponse } from "next/server";

import { cachedLookup, lookupPostcode } from "@/lib/address/lookup";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getClientIp } from "@/lib/rate-limit/ip";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** GET /api/address-lookup?postcode=B15 2TT → streets + mapped houses around it. */
export async function GET(request: Request) {
  const postcode = (new URL(request.url).searchParams.get("postcode") ?? "").trim();
  if (!UK_POSTCODE_RE.test(postcode)) {
    return NextResponse.json({ error: "Invalid postcode" }, { status: 400 });
  }

  // Cached postcodes cost nothing; only outbound lookups are rate-limited.
  const cached = cachedLookup(postcode);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=86400" } });

  const ip = await getClientIp();
  if (!(await checkRateLimit(`address-lookup:${ip}`, { limit: 60, windowMs: 10 * 60_000 }))) {
    return NextResponse.json({ error: "Too many lookups — please type your address." }, { status: 429 });
  }

  const result = await lookupPostcode(postcode);
  if (!result) return NextResponse.json({ error: "Postcode not found" }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=86400" } });
}
