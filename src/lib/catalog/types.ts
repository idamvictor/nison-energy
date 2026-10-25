// Catalog view types + option lists — safe to import from client components.
// The persisted shape is `Product` in prisma/schema.prisma; src/lib/catalog/queries.ts
// maps a row to the view types below.

// ─── Category / routing ────────────────────────────────────────────────────
export type ProductCategory = "Residential" | "Commercial" | "Accessory" | "Solar" | "CircuitProtection";

export const productCategories: ProductCategory[] = [
  "Residential",
  "Commercial",
  "Accessory",
  "Solar",
  "CircuitProtection",
];

// The storefront route + cart-category string for each catalog category.
export const categoryRoute: Record<ProductCategory, string> = {
  Residential: "/home-charging",
  Commercial: "/workplace-charging",
  Accessory: "/accessories",
  Solar: "/solar-panels",
  CircuitProtection: "/circuit-protectors",
};

// The admin edit route for each catalog category — same `[slug]` param as
// the storefront route (a product's `id` is shared by both).
export const adminRoute: Record<ProductCategory, string> = {
  Residential: "/admin/residential",
  Commercial: "/admin/commercial",
  Accessory: "/admin/accessories",
  Solar: "/admin/solar-panels",
  CircuitProtection: "/admin/circuit-protectors",
};

/** Which images the admin media library shows: one product section, or blog covers. */
export type MediaScope = ProductCategory | "blog";

export const mediaScopeLabel: Record<MediaScope, string> = {
  Residential: "Residential Chargers",
  Commercial: "Commercial Chargers",
  Accessory: "Accessories",
  Solar: "Solar Panels",
  CircuitProtection: "Circuit Protectors",
  blog: "Blog",
};

export function isMediaScope(value: string | null): value is MediaScope {
  return value === "blog" || productCategories.includes(value as ProductCategory);
}

export type CartCategory = "residential" | "commercial" | "accessories" | "solar" | "circuit-protectors";

export const categoryToCart: Record<ProductCategory, CartCategory> = {
  Residential: "residential",
  Commercial: "commercial",
  Accessory: "accessories",
  Solar: "solar",
  CircuitProtection: "circuit-protectors",
};

const cartRoute: Record<CartCategory, string> = {
  residential: "/home-charging",
  commercial: "/workplace-charging",
  accessories: "/accessories",
  solar: "/solar-panels",
  "circuit-protectors": "/circuit-protectors",
};

export function cartItemHref(category: CartCategory, id: string): string {
  return `${cartRoute[category] ?? "/accessories"}/${id}`;
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
  /** "Was" price inc VAT while on sale (only shown when above `price`). */
  compareAtPrice?: number;
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
  compatibleTariffs?: string[];
  price: number;
  /** "Was" price inc VAT while on sale (only shown when above `price`). */
  compareAtPrice?: number;
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
  compatibleTariffs?: string[];
  price: number;
  /** "Was" price inc VAT while on sale (only shown when above `price`). */
  compareAtPrice?: number;
  tags: string[];
  image: string;
  active?: boolean;
  featured?: boolean;
};

// ─── Solar ─────────────────────────────────────────────────────────────────
// Plug-in solar kits: no installation option and no cable/length variants.
export type SolarProduct = {
  id: string;
  name: string;
  brand: string;
  colour: string;
  price: number;
  /** "Was" price inc VAT while on sale (only shown when above `price`). */
  compareAtPrice?: number;
  tags: string[];
  image: string;
  active?: boolean;
  featured?: boolean;
};

// ─── Circuit protectors ────────────────────────────────────────────────────
// Consumer units, RCBO kits, isolators… (under Accessories in the menu): no
// installation option and no variants. Same shape as a solar kit.
export type CircuitProtectorProduct = SolarProduct;

// ─── Detail-page content ───────────────────────────────────────────────────
/** One row of the spec table; `section` groups rows under a heading (e.g. "Panel"). */
export type Spec = { label: string; value: string; section?: string };

export type ProductDetail = {
  tagline: string;
  sku?: string;
  gallery: string[];
  description: string[];
  features: string[];
  specs: Spec[];
  warranty: string;
  /** Datasheet PDF URLs, in display order (empty = no Datasheet tab). */
  datasheets: string[];
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
  compareAtPrice: number | null;
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
  datasheets: string[];
};

export type WriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
