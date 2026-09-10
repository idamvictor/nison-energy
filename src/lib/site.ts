// Public origin of the deployed site. Used for absolute URLs in the sitemap,
// RSS feed, and metadata. Set NEXT_PUBLIC_SITE_URL to the production origin on
// the host (e.g. https://ocunioenergy.com); falls back to localhost in dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";
