// Client-safe datasheet helpers (no server-only imports) — shared by the
// upload code in queries.ts and the Drive-style card in the UI.

export const DATASHEET_URL_PREFIX = "/api/media/datasheets/";

/** Most datasheets one product can have. */
export const MAX_DATASHEETS = 10;

const UUID_PDF_RE = /^[0-9a-f-]{36}\.pdf$/i;

/** Slugified, length-capped version of an uploaded file's name (no extension). */
export function datasheetSafeName(originalName: string): string {
  const base = originalName.replace(/\.pdf$/i, "");
  const slug = base
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80)
    .replace(/^-|-$/g, "");
  return slug || "datasheet";
}

// Each datasheet's page-1 preview image lives next to its PDF at a fixed key,
// datasheets/<uuid>/preview (WebP, or PNG from browsers that can't encode
// WebP — the stored content type says which).
export const DATASHEET_PREVIEW_TYPES = ["image/webp", "image/png"];
export const MAX_DATASHEET_PREVIEW_BYTES = 1024 * 1024; // 1MB

/** Object key for a datasheet's preview image, from its PDF key. */
export function datasheetPreviewKey(pdfKey: string): string {
  return `${pdfKey.slice(0, pdfKey.lastIndexOf("/"))}/preview`;
}

/**
 * Preview image URL for a datasheet URL, or null for legacy uploads
 * (`datasheets/<uuid>.pdf` — no folder, so no preview). The card falls back
 * to rendering the PDF itself if this is null or the image is missing.
 */
export function datasheetPreviewUrl(url: string): string | null {
  const rest = url.slice(DATASHEET_URL_PREFIX.length);
  if (!url.startsWith(DATASHEET_URL_PREFIX) || !rest.includes("/")) return null;
  return `${DATASHEET_URL_PREFIX}${rest.slice(0, rest.indexOf("/"))}/preview`;
}

/**
 * Display name for a datasheet URL — its last path segment. Uploads from
 * before names were kept are just `<uuid>.pdf`, so show a generic name.
 */
export function datasheetFileName(url: string): string {
  const last = decodeURIComponent(url.split("/").pop() ?? "");
  if (!last || UUID_PDF_RE.test(last)) return "Datasheet.pdf";
  return last;
}
