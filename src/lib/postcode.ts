// UK postcode check — format first, then postcodes.io (free, no key, CORS
// enabled) to confirm the postcode really exists. Safe on client and server.

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export type PostcodeCheck =
  | { valid: true; postcode: string; town: string | null }
  | { valid: false; reason: string };

export function normalisePostcode(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}

export async function checkUkPostcode(value: string): Promise<PostcodeCheck> {
  const postcode = normalisePostcode(value);
  if (!UK_POSTCODE_RE.test(postcode)) {
    return { valid: false, reason: "That doesn't look like a UK postcode." };
  }
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (res.status === 404) return { valid: false, reason: "We couldn't find that postcode." };
    if (!res.ok) return { valid: true, postcode, town: null }; // lookup down — don't block on format-valid postcodes
    const data = (await res.json()) as { result?: { postcode?: string; admin_district?: string | null } };
    return { valid: true, postcode: data.result?.postcode ?? postcode, town: data.result?.admin_district ?? null };
  } catch {
    return { valid: true, postcode, town: null }; // network error — format already checked
  }
}
