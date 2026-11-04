/**
 * One-off: add the new Cables range — the Doncaster Cables Meter Tail Pack in
 * 8 sizes (one row per pack, sharing a variantGroup) and the two EV Ultra
 * install kits. Every name, paragraph, list line and spec row comes from
 * scripts/data/cable-products.json, extracted straight from the client's doc
 * (word for word). Creates exactly these 10 products — refuses if any SKU or
 * id already exists.
 *
 *   npx tsx scripts/add-cable-products.ts            # dry run
 *   npx tsx scripts/add-cable-products.ts --commit   # apply
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prisma } from "../src/lib/db";
import { incVatOf } from "../src/lib/pricing-review/types";
import { cableAttrsToFilters, type CableAttrs } from "../src/lib/catalog/cable-attrs";

const COMMIT = process.argv.includes("--commit");

type Spec = { label: string; value: string };
type Data = {
  meterTails: {
    family: string;
    description: string[];
    specs: Spec[];
    gallery: string[];
    sizes: { title: string; sku: string; exVat: number; incVatDoc: number; length: string; core: string }[];
  };
  kits: { name: string; sku: string; exVat: number; incVat: number; description: string[]; features: string[]; specs: Spec[]; gallery: string[] }[];
};

const data = JSON.parse(readFileSync(join(__dirname, "data", "cable-products.json"), "utf8")) as Data;

// Same rule as the admin form's slugify(), so a later Save keeps these URLs.
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const METER_TAIL_GROUP = "doncaster-cables-meter-tail-pack";

type Row = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  exVat: number;
  attrs: CableAttrs;
  tagline: string | null;
  variantGroup: string | null;
  description: string[];
  features: string[];
  specs: Spec[];
  gallery: string[];
};

async function main() {
  const rows: Row[] = [
    ...data.meterTails.sizes.map((size) => {
      const price = incVatOf(size.exVat);
      // The doc's inc-VAT figures all equal ex VAT × 1.2, except MTP516.0
      // ("£71.98" — sold at £71.99, as agreed 2026-11-04).
      if (price !== size.incVatDoc) console.log(`  note: ${size.sku} doc says £${size.incVatDoc} inc VAT; using £${price} (= £${size.exVat} × 1.2)`);
      return {
        id: slugify(size.title),
        name: size.title,
        sku: size.sku,
        brand: "Doncaster Cables",
        price,
        exVat: size.exVat,
        attrs: { type: "Meter Tails" as const, length: size.length, core: size.core },
        tagline: data.meterTails.family,
        variantGroup: METER_TAIL_GROUP,
        description: data.meterTails.description,
        features: [],
        specs: data.meterTails.specs,
        gallery: data.meterTails.gallery,
      };
    }),
    ...data.kits.map((kit) => {
      if (incVatOf(kit.exVat) !== kit.incVat) throw new Error(`${kit.sku}: £${kit.exVat} × 1.2 ≠ £${kit.incVat}`);
      return {
        id: slugify(kit.name),
        name: kit.name,
        sku: kit.sku,
        brand: "Ocunio Energy",
        price: kit.incVat,
        exVat: kit.exVat,
        attrs: { type: "EV Ultra Install Kit" as const },
        tagline: null,
        variantGroup: null,
        description: kit.description,
        features: kit.features,
        specs: kit.specs,
        gallery: kit.gallery,
      };
    }),
  ];

  const clash = await prisma.product.findFirst({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash) throw new Error(`Already exists: ${clash.sku} (${clash.id}) — nothing changed`);

  for (const r of rows) {
    console.log(`${r.sku.padEnd(20)} £${r.exVat.toFixed(2)} ex → £${r.price.toFixed(2)} inc | ${r.attrs.type}${r.attrs.length ? ` ${r.attrs.length} ${r.attrs.core}` : ""} | ${r.name}`);
  }
  console.log(`${rows.length} products · ${rows[0].specs.length} meter tail spec rows · kit specs ${data.kits.map((k) => k.specs.length).join("/")}`);
  if (!COMMIT) {
    console.log("Dry run — pass --commit to create the products.");
    return;
  }

  for (const [index, r] of rows.entries()) {
    await prisma.product.create({
      data: {
        id: r.id,
        category: "Cable",
        name: r.name,
        brand: r.brand,
        sku: r.sku,
        colour: "",
        cardImage: r.gallery[0],
        gallery: r.gallery,
        variantGroup: r.variantGroup,
        tagline: r.tagline,
        filters: cableAttrsToFilters(r.attrs),
        active: true,
        featured: false,
        sortOrder: index,
        price: r.price.toFixed(2),
        description: r.description,
        features: r.features,
        specs: r.specs,
      },
    });
    console.log(`Created ${r.id}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
