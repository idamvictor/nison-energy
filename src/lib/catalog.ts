// Catalog types + option lists — safe to import from client components.
// Server reads/writes live in src/lib/catalog-dal.ts.

export type ProductCategory = "Residential" | "Commercial" | "Accessory";

export const productCategories: ProductCategory[] = [
  "Residential",
  "Commercial",
  "Accessory",
];

// The storefront route + cart-category string for each catalog category.
export const categoryRoute: Record<ProductCategory, string> = {
  Residential: "/home-charging",
  Commercial: "/workplace-charging",
  Accessory: "/accessories",
};

export type CartCategory = "residential" | "commercial" | "accessories";

export const categoryToCart: Record<ProductCategory, CartCategory> = {
  Residential: "residential",
  Commercial: "commercial",
  Accessory: "accessories",
};

export function cartItemHref(category: CartCategory, id: string): string {
  const base =
    category === "residential"
      ? "/home-charging"
      : category === "commercial"
        ? "/workplace-charging"
        : "/accessories";
  return `${base}/${id}`;
}

// Admin form option lists.
export const connectionTypes = ["Tethered", "Untethered"] as const;
export const accessoryStyles = ["Coiled", "Straight"] as const;
export const accessoryPhases = ["Single Phase", "3 Phase"] as const;
export const knownTariffs = ["Octopus Energy", "OVO Energy"] as const;
