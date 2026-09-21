// Merges colour/length sibling rows (sharing one `variantGroup`) into a
// single listing card — one row per DB Product, one card per real product.
// A `variantGroup` can occasionally span more than one connection type/style
// (e.g. a Tethered + an Untethered row sharing one write-up in the source
// spreadsheet) — that's a real product distinction, not a cosmetic one, so
// `typeOf` keeps those apart even when they share a `variantGroup`.

export function groupByVariant<
  T extends { id: string; variantGroup?: string; price: number },
>(products: T[], typeOf: (p: T) => string): { key: string; variants: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const p of products) {
    const key = p.variantGroup ? `${p.variantGroup}::${typeOf(p)}` : p.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return [...groups.entries()].map(([key, variants]) => ({ key, variants }));
}

// Mirrors the colour-word list already used server-side during import
// (scripts/import-catalogue.ts) — strips a trailing " - Black"/" White" etc.
// so a merged card's title doesn't imply it's only the one colour.
const COLOUR_WORDS = [
  "Space Grey",
  "Moonlight Cream",
  "Shadow Black",
  "Sage Green",
  "Deep Red",
  "Anthracite",
  "Black",
  "White",
  "Grey",
  "Green",
  "Red",
  "Blue",
  "Yellow",
];

export function cleanVariantName(name: string): string {
  const pattern = new RegExp(`\\s*[-–]\\s*(${COLOUR_WORDS.join("|")})\\s*$`, "i");
  return name.replace(pattern, "").trim();
}
