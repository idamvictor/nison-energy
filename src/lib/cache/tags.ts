/**
 * Cache tags for unstable_cache()-wrapped reads. Pass the matching tag to
 * revalidateTag() at every mutation site that writes the underlying table.
 * Keep this list flat and by-table — finer-grained tags (e.g. per-lead) add
 * invalidation-bug surface for a marginal hit-rate win on data this small.
 */
export const CACHE_TAGS = {
  leads: "leads",
  orders: "orders",
  quotes: "quotes",
  products: "products",
  notifications: "notifications",
} as const;
