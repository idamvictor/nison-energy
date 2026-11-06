/**
 * One-off: move the Tesla Wall Connector Gen 3 + Matt:e bundle from
 * Commercial to Residential. Category only — copy, price, images and
 * warranty are untouched. Updates by SKU; never creates products.
 * The old /workplace-charging/<id> link redirects to /home-charging/<id>.
 *
 *   npx tsx scripts/move-tesla-to-residential.ts            # dry run
 *   npx tsx scripts/move-tesla-to-residential.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const SKU = "TES-WALLCONNECTOR-G3-PACK";

async function main() {
  const rows = await prisma.product.findMany({
    where: { sku: SKU },
    select: { id: true, name: true, category: true },
  });
  if (rows.length === 0) throw new Error(`No product with SKU ${SKU}`);
  for (const r of rows) console.log(`${SKU} [${r.category}] ${r.id} — ${r.name}`);

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  const { count } = await prisma.product.updateMany({ where: { sku: SKU }, data: { category: "Residential" } });
  console.log(`Moved ${count} product(s) to Residential.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
