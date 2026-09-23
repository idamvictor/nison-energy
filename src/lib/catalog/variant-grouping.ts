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
