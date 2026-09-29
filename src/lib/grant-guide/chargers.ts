import "server-only";

import { getCommercialCatalog, getResidentialCatalog } from "@/lib/catalog/queries";
import type { CommercialProduct, Product } from "@/lib/catalog/types";
import type { ChargerSelection, GuideCharger } from "@/lib/grant-guide/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Product names often end with the variant (" 5m - Black"). The finder shows
 * one card per product, so strip trailing colour/length tokens for its title;
 * the exact variant name is still used on the quote.
 */
function baseName(p: Product | CommercialProduct): string {
  let name = p.name.trim();
  for (const token of [p.colour, p.cableLength].filter(Boolean) as string[]) {
    name = name.replace(new RegExp(`[\\s\\-–,]*${escapeRe(token)}\\s*$`, "i"), "").trim();
  }
  return name.replace(/[\s\-–,]+$/, "") || p.name;
}

function toGuideChargers(
  products: (Product | CommercialProduct)[],
  category: GuideCharger["category"],
): GuideCharger[] {
  // One card per real product. Unlike the shop grid (groupByVariant), colours
  // are NOT split into separate cards — the selected-charger card already lets
  // the customer switch colour and cable length. Connection type stays a real
  // product distinction.
  const groups = new Map<string, (Product | CommercialProduct)[]>();
  for (const p of products) {
    const key = p.variantGroup ? `${p.variantGroup}::${p.connectionType}` : p.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return [...groups.entries()].map(([key, variants]) => {
    const sorted = [...variants].sort((a, b) => a.price - b.price);
    const rep = sorted[0];
    return {
      key: `${category}:${key}`,
      category,
      name: baseName(rep),
      brand: rep.brand,
      image: rep.image,
      powerOutput: rep.powerOutput,
      connectionType: rep.connectionType,
      featured: variants.some((v) => v.featured),
      fromPriceExVat: round2(rep.price / 1.2),
      variants: sorted.map((v) => ({
        id: v.id,
        name: v.name,
        colour: v.colour,
        cableLength: v.cableLength,
        image: v.image,
        priceIncVat: v.price,
        priceExVat: round2(v.price / 1.2),
      })),
    };
  });
}

/** Every active home + commercial charger, grouped one-per-product, for the OZEV guides. */
export async function getGuideChargers(): Promise<GuideCharger[]> {
  const [home, commercial] = await Promise.all([getResidentialCatalog(), getCommercialCatalog()]);
  return [...toGuideChargers(home, "home"), ...toGuideChargers(commercial, "commercial")];
}

/** Resolves `?charger=<productId>` to a finder selection (null if unknown/inactive). */
export function selectionForProduct(
  chargers: GuideCharger[],
  productId: string | undefined,
): ChargerSelection | null {
  if (!productId) return null;
  const group = chargers.find((c) => c.variants.some((v) => v.id === productId));
  return group ? { key: group.key, variantId: productId } : null;
}
