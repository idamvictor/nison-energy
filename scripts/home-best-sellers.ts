/**
 * One-off: the home page "Our Best-Selling Chargers" section shows every
 * active Residential charger ticked "Featured on home page". This swaps the
 * picks per the client's review: out go Garo, Myenergi and FastAmps
 * (FastAmps lives in the budget section); in come Ohme ePod, Indra Smart Pro
 * Tethered and Hypervolt Space Grey. Featured flag only — never creates
 * products. Change picks later with the admin's "Featured on home page" tick.
 *
 *   npx tsx scripts/home-best-sellers.ts            # dry run
 *   npx tsx scripts/home-best-sellers.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";
import type { Prisma } from "../src/generated/prisma/client";

const COMMIT = process.argv.includes("--commit");

const UNFEATURE: Prisma.ProductWhereInput[] = [
  { sku: "GEV7.40" }, // Garo Home Charging Untethered
  { sku: "2H07UB" }, // Myenergi Zappi
  { sku: "Fastamps", connectionType: "Untethered" }, // both FastAmps share the SKU
];
const FEATURE: Prisma.ProductWhereInput[] = [
  { sku: "OHMEX1GB003-BL" }, // Ohme ePod Untethered – Black
  { sku: "SPRFGT2WG406" }, // Indra Smart Pro Tethered 6m – White
  { sku: "HV3PROAASG050T2" }, // Hypervolt Home Pro 3 Tethered 5m – Space Grey
];

const scope = (list: Prisma.ProductWhereInput[]): Prisma.ProductWhereInput => ({
  category: "Residential",
  OR: list,
});

async function main() {
  for (const [label, list] of [
    ["Unfeature", UNFEATURE],
    ["Feature", FEATURE],
  ] as const) {
    const rows = await prisma.product.findMany({
      where: scope(list),
      select: { sku: true, name: true, featured: true, connectionType: true },
    });
    console.log(`${label} (${rows.length}/${list.length}):`);
    for (const r of rows) console.log(`  ${r.sku} [${r.connectionType}] featured=${r.featured} — ${r.name}`);
    if (rows.length !== list.length) throw new Error(`${label}: expected ${list.length} products, found ${rows.length}`);
  }

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  const off = await prisma.product.updateMany({ where: scope(UNFEATURE), data: { featured: false } });
  const on = await prisma.product.updateMany({ where: scope(FEATURE), data: { featured: true } });
  console.log(`Unfeatured ${off.count}, featured ${on.count}.`);

  const now = await prisma.product.findMany({
    where: { category: "Residential", featured: true, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { sku: true, name: true },
  });
  console.log("Best-sellers now:");
  for (const r of now) console.log(`  ${r.sku} — ${r.name}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
