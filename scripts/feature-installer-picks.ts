/**
 * One-off: tick "Featured on home page" on the trade items the client's
 * review doc listed for the home page, so they show in the "For Installers"
 * section. Updates by SKU only — never creates products. Change the picks
 * later with the admin's "Featured on home page" tick.
 *
 *   npx tsx scripts/feature-installer-picks.ts            # dry run
 *   npx tsx scripts/feature-installer-picks.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const SKUS = ["WMRC40BSP", "WMEPME08/SP", "SP-EVCP-R"];

async function main() {
  const rows = await prisma.product.findMany({
    where: { sku: { in: SKUS } },
    select: { id: true, sku: true, category: true, name: true, featured: true },
  });
  for (const r of rows) console.log(`${r.sku} [${r.category}] featured=${r.featured} — ${r.name}`);
  const missing = SKUS.filter((s) => !rows.some((r) => r.sku === s));
  if (missing.length) console.log(`Not found (skipped): ${missing.join(", ")}`);

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  const { count } = await prisma.product.updateMany({ where: { sku: { in: SKUS } }, data: { featured: true } });
  console.log(`Featured ${count} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
