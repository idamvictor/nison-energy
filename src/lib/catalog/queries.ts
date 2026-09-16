import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Product as ProductRow } from "@/generated/prisma/client";
import type {
  AccessoryProduct,
  CommercialProduct,
  Product,
  ProductCategory,
  ProductDetail,
  ProductInput,
  Spec,
  WriteResult,
} from "@/lib/catalog/types";

// ─── Row → view-type mappers ────────────────────────────────────────────────

function specsOf(row: ProductRow): Spec[] {
  return Array.isArray(row.specs) ? (row.specs as unknown as Spec[]) : [];
}

export function dbToResidential(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    spec: row.spec ?? "",
    connectionType: (row.connectionType as Product["connectionType"]) ?? "Untethered",
    cableLength: row.cableLength ?? undefined,
    cableLengthOptions:
      row.cableLengthOptions.length > 0 ? row.cableLengthOptions : undefined,
    colour: row.colour,
    powerOutput: row.powerOutput ?? "",
    variantGroup: row.variantGroup ?? undefined,
    compatibleTariffs:
      row.compatibleTariffs.length > 0 ? row.compatibleTariffs : undefined,
    price: row.price ?? 0,
    installFee: row.installFee ?? undefined,
    tags: row.tags,
    image: row.cardImage,
    warranty: row.warranty ?? undefined,
    active: row.active,
    featured: row.featured,
  };
}

export function dbToCommercial(row: ProductRow): CommercialProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    spec: row.spec ?? "",
    connectionType:
      (row.connectionType as CommercialProduct["connectionType"]) ?? "Untethered",
    cableLength: row.cableLength ?? undefined,
    colour: row.colour,
    powerOutput: row.powerOutput ?? "",
    variantGroup: row.variantGroup ?? undefined,
    price: row.price ?? 0,
    installFee: row.installFee ?? undefined,
    tags: row.tags,
    image: row.cardImage,
    warranty: row.warranty ?? undefined,
    active: row.active,
    featured: row.featured,
  };
}

export function dbToAccessory(row: ProductRow): AccessoryProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    style: (row.style as AccessoryProduct["style"]) ?? "Straight",
    colour: row.colour,
    phase: (row.phase as AccessoryProduct["phase"]) ?? "Single Phase",
    lengthOptions: row.lengthOptions,
    variantGroup: row.variantGroup ?? "",
    tags: row.tags,
    image: row.cardImage,
    active: row.active,
    featured: row.featured,
  };
}

export function toAdminRow(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    colour: row.colour,
    image: row.cardImage,
    tags: row.tags,
    price: row.price ?? undefined,
    style: row.style ?? undefined,
    phase: row.phase ?? undefined,
    active: row.active,
    featured: row.featured,
  };
}

export function dbToDetail(row: ProductRow): ProductDetail {
  return {
    tagline: row.tagline ?? "",
    gallery: row.gallery.length > 0 ? row.gallery : [row.cardImage],
    description: row.description,
    features: row.features,
    specs: specsOf(row),
    warranty: row.warranty ?? "",
  };
}

// ─── Storefront reads (active only) ─────────────────────────────────────────

const catalogOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

export const getResidentialCatalog = cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true, category: "Residential" },
    orderBy: catalogOrder,
  });
  return rows.map(dbToResidential);
});

export const getCommercialCatalog = cache(async (): Promise<CommercialProduct[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true, category: "Commercial" },
    orderBy: catalogOrder,
  });
  return rows.map(dbToCommercial);
});

export const getAccessoryCatalog = cache(async (): Promise<AccessoryProduct[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true, category: "Accessory" },
    orderBy: catalogOrder,
  });
  return rows.map(dbToAccessory);
});

export const getProductRow = cache((id: string) =>
  prisma.product.findUnique({ where: { id } }),
);

export const getFeatured = cache(
  (category: ProductCategory, limit: number) =>
    prisma.product.findMany({
      where: { active: true, category, featured: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: limit,
    }),
);

export const getProductCounts = cache(async () => {
  const grouped = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const count = (c: ProductCategory) =>
    grouped.find((g) => g.category === c)?._count._all ?? 0;
  return {
    residential: count("Residential"),
    commercial: count("Commercial"),
    accessory: count("Accessory"),
  };
});

export const getChargerOptions = cache(() =>
  prisma.product.findMany({
    where: { category: { in: ["Residential", "Commercial"] } },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { id: true, name: true, colour: true, category: true },
  }),
);

// ─── Admin reads (includes inactive) ───────────────────────────────────────

export const getAdminProducts = cache((category: ProductCategory) =>
  prisma.product.findMany({
    where: { category },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  }),
);

// ─── Writes ────────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(input: ProductInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.brand.trim()) return "Brand is required.";
  if (!input.colour.trim()) return "Colour is required.";
  if (!input.cardImage.trim()) return "A card image URL is required.";
  return null;
}

function toData(input: ProductInput) {
  return {
    category: input.category,
    name: input.name.trim(),
    brand: input.brand.trim(),
    colour: input.colour.trim(),
    cardImage: input.cardImage.trim(),
    tags: input.tags,
    variantGroup: input.variantGroup?.trim() || null,
    active: input.active,
    featured: input.featured,
    sortOrder: input.sortOrder,
    spec: input.spec?.trim() || null,
    connectionType: input.connectionType || null,
    cableLength: input.cableLength?.trim() || null,
    powerOutput: input.powerOutput?.trim() || null,
    price: input.price ?? null,
    installFee: input.installFee ?? null,
    cableLengthOptions: input.cableLengthOptions,
    compatibleTariffs: input.compatibleTariffs,
    style: input.style || null,
    phase: input.phase || null,
    lengthOptions: input.lengthOptions,
    tagline: input.tagline?.trim() || null,
    gallery: input.gallery,
    description: input.description,
    features: input.features,
    specs: input.specs as object,
    warranty: input.warranty?.trim() || null,
  };
}

export async function createProduct(
  slug: string,
  input: ProductInput,
): Promise<WriteResult> {
  await requireAdmin();
  const id = slug.trim().toLowerCase();
  if (!SLUG_RE.test(id)) {
    return { ok: false, error: "Slug must be lowercase words separated by hyphens." };
  }
  const err = validate(input);
  if (err) return { ok: false, error: err };
  if (await prisma.product.findUnique({ where: { id }, select: { id: true } })) {
    return { ok: false, error: `A product with slug "${id}" already exists.` };
  }
  await prisma.product.create({ data: { id, ...toData(input) } });
  return { ok: true, id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<WriteResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };
  await prisma.product.update({ where: { id }, data: toData(input) });
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<WriteResult> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  return { ok: true, id };
}
