// Swatch colours for colour-variant products (Accessories ▸ Covers). Keyed by
// the lower-cased Product.colour; the fascia values are sampled from the
// client's product photos. Client-safe.

const swatches: Record<string, string> = {
  "pearl white": "#f4f4f1",
  "pure white": "#f4f4f1",
  white: "#f4f4f1",
  "anthracite grey": "#3d4343",
  "sapphire blue": "#404f64",
  "sage green": "#5a6e4b",
  black: "#111111",
};

/** A CSS colour for a product colour name; unknown names get a neutral grey. */
export function swatchColour(name: string): string {
  return swatches[name.trim().toLowerCase()] ?? "#9ca3af";
}
