/**
 * Time-based safety-net ceilings for unstable_cache(). Tag-based
 * revalidation (see tags.ts) is the primary invalidation path; these just
 * bound staleness if a revalidateTag() call is ever missed at a new
 * mutation site.
 */
export const CACHE_TTL = {
  adminMetrics: 45, // seconds
  search: 300, // seconds
} as const;
