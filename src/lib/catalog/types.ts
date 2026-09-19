// Catalog view types + option lists — safe to import from client components.
// The persisted shape is `Product` in prisma/schema.prisma; src/lib/catalog/queries.ts
// maps a row to the view types below.

// ─── Category / routing ────────────────────────────────────────────────────
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

// The admin edit route for each catalog category — same `[slug]` param as
// the storefront route (a product's `id` is shared by both).
export const adminRoute: Record<ProductCategory, string> = {
  Residential: "/admin/residential",
  Commercial: "/admin/commercial",
  Accessory: "/admin/accessories",
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

// ─── Residential ───────────────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  brand: string;
  spec: string;
  connectionType: "Tethered" | "Untethered";
  cableLength?: string;
  cableLengthOptions?: string[];
  colour: string;
  powerOutput: string;
  variantGroup?: string;
  compatibleTariffs?: string[];
  price: number;
  installFee?: number;
  tags: string[];
  image: string;
  warranty?: string;
  active?: boolean;
  featured?: boolean;
};

// ─── Commercial ────────────────────────────────────────────────────────────
export type CommercialProduct = {
  id: string;
  name: string;
  brand: string;
  spec: string;
  connectionType: "Tethered" | "Untethered";
  cableLength?: string;
  colour: string;
  powerOutput: string;
  variantGroup?: string;
  price: number;
  installFee?: number;
  tags: string[];
  image: string;
  warranty?: string;
  active?: boolean;
  featured?: boolean;
};

// ─── Accessory ─────────────────────────────────────────────────────────────
export type AccessoryProduct = {
  id: string;
  name: string;
  brand: string;
  style: "Coiled" | "Straight";
  colour: string;
  phase: "Single Phase" | "3 Phase";
  lengthOptions: string[];
  variantGroup: string;
  price: number;
  tags: string[];
  image: string;
  active?: boolean;
  featured?: boolean;
};

// ─── Detail-page content ───────────────────────────────────────────────────
export type Spec = { label: string; value: string };

export type ProductDetail = {
  tagline: string;
  sku?: string;
  gallery: string[];
  description: string[];
  features: string[];
  specs: Spec[];
  warranty: string;
};

// ─── Admin write shapes ────────────────────────────────────────────────────

export type ProductInput = {
  category: ProductCategory;
  name: string;
  brand: string;
  sku: string | null;
  colour: string;
  cardImage: string;
  tags: string[];
  variantGroup: string | null;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  spec: string | null;
  connectionType: string | null;
  cableLength: string | null;
  powerOutput: string | null;
  price: number | null;
  installFee: number | null;
  cableLengthOptions: string[];
  compatibleTariffs: string[];
  style: string | null;
  phase: string | null;
  lengthOptions: string[];
  tagline: string | null;
  gallery: string[];
  description: string[];
  features: string[];
  specs: Spec[];
  warranty: string | null;
};

export type WriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
