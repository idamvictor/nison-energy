// Merges colour/length sibling rows (sharing one `variantGroup`) into a
// single listing card — one row per DB Product, one card per real product.
// A `variantGroup` can occasionally span more than one connection type/style
// (e.g. a Tethered + an Untethered row sharing one write-up in the source
// spreadsheet) — that's a real product distinction, not a cosmetic one, so
// `typeOf` keeps those apart even when they share a `variantGroup`.

export function groupByVariant<
  T extends { id: string; variantGroup?: string; price: number; colour: string },
>(products: T[], typeOf: (p: T) => string): { key: string; variants: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const p of products) {
    const key = p.variantGroup
      ? `${p.variantGroup}::${typeOf(p)}::${p.colour}`
      : p.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return [...groups.entries()].map(([key, variants]) => ({ key, variants }));
}

// Filter-sidebar counts must reflect how many *cards* a facet value would
// produce, not how many raw DB rows match it — a product with a dozen cable
// lengths is still one card, so counting rows badly inflates the number
// shown next to brand/colour/etc. Partition products by `valueOf`, then
// group each partition the same way the catalog grid does.
export function groupedFacetCounts<
  T extends { id: string; variantGroup?: string; price: number; colour: string },
>(
  products: T[],
  typeOf: (p: T) => string,
  valueOf: (p: T) => string
): Map<string, number> {
  const byValue = new Map<string, T[]>();
  for (const p of products) {
    const v = valueOf(p);
    if (!byValue.has(v)) byValue.set(v, []);
    byValue.get(v)!.push(p);
  }
  const counts = new Map<string, number>();
  for (const [v, items] of byValue) {
    counts.set(v, groupByVariant(items, typeOf).length);
  }
  return counts;
}

// Same idea for price-bucket counts, where membership is a range test
// instead of an exact value match.
export function groupedBucketCounts<
  T extends { id: string; variantGroup?: string; price: number; colour: string },
>(
  products: T[],
  typeOf: (p: T) => string,
  buckets: { key: string; test: (price: number) => boolean }[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const bucket of buckets) {
    const matching = products.filter((p) => bucket.test(p.price));
    counts.set(bucket.key, groupByVariant(matching, typeOf).length);
  }
  return counts;
}
