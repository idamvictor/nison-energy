/**
 * One-off: Matt:e moves from Accessories to Circuit Protection (brand "Matt:e").
 * Deletes the old Accessory listing (SKU SP-EVCP-R) and creates the two new
 * products from scripts/data/matte-products.json, extracted word for word from
 * the client's doc (SP-EVCP-R's accidentally repeated opening dropped, as
 * agreed 2026-11-04). One transaction: the new SP-EVCP-R reuses the SKU.
 * Refuses if the old row has orders / price reviews, or the new ids exist.
 *
 *   npx tsx scripts/move-matte-to-circuit-protection.ts            # dry run
 *   npx tsx scripts/move-matte-to-circuit-protection.ts --commit   # apply
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prisma } from "../src/lib/db";
import { incVatOf } from "../src/lib/pricing-review/types";

const COMMIT = process.argv.includes("--commit");
const OLD_ID = "tesla-matt-e-single-phase-monitoring-and-protection-unit-with-built-in-rcbo-black";

type Data = {
  brand: string;
  products: {
    name: string;
    sku: string;
    exVat: number;
    incVat: number;
    colour: string;
    description: string[];
    specs: { label: string; value: string }[];
    gallery: string[];
    featured: boolean;
  }[];
};

const data = JSON.parse(readFileSync(join(__dirname, "data", "matte-products.json"), "utf8")) as Data;
// Same rule as the admin form's slugify(), so a later Save keeps these URLs.
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function main() {
  const old = await prisma.product.findFirst({
    where: { id: OLD_ID, sku: "SP-EVCP-R", category: "Accessory" },
    select: { id: true, name: true, price: true },
  });
  if (old) {
    const [items, proposals] = await Promise.all([
      prisma.orderItem.count({ where: { productId: old.id } }),
      prisma.priceProposal.count({ where: { productId: old.id } }),
    ]);
    if (items || proposals) throw new Error(`Old listing has ${items} order items / ${proposals} price reviews — not deleting`);
    console.log(`DELETE  [Accessory] ${old.name} (£${old.price})`);
  } else {
    console.log("Old Accessory listing already gone.");
  }

  const rows = data.products.map((p) => {
    if (incVatOf(p.exVat) !== p.incVat) throw new Error(`${p.sku}: £${p.exVat} × 1.2 ≠ £${p.incVat}`);
    return { ...p, id: slugify(p.name) };
  });
  const clash = await prisma.product.findFirst({ where: { id: { in: rows.map((r) => r.id) } }, select: { id: true } });
  if (clash) throw new Error(`Already exists: ${clash.id} — nothing changed`);
  const last = await prisma.product.aggregate({ where: { category: "CircuitProtection" }, _max: { sortOrder: true } });
  const sortOrder = (last._max.sortOrder ?? 0) + 1;

  for (const r of rows) {
    console.log(`CREATE  [CircuitProtection] ${r.sku}  £${r.exVat} ex → £${r.incVat} inc  featured=${r.featured}  ${r.name}  (${r.specs.length} specs)`);
  }
  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }

  await prisma.$transaction([
    ...(old ? [prisma.product.delete({ where: { id: old.id } })] : []),
    ...rows.map((r, index) =>
      prisma.product.create({
        data: {
          id: r.id,
          category: "CircuitProtection",
          name: r.name,
          brand: data.brand,
          sku: r.sku,
          colour: r.colour,
          cardImage: r.gallery[0],
          gallery: r.gallery,
          active: true,
          featured: r.featured,
          sortOrder: sortOrder + index,
          price: r.incVat.toFixed(2),
          description: r.description,
          specs: r.specs,
          warranty: "3 years",
        },
      }),
    ),
  ]);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
