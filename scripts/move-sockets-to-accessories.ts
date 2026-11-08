/**
 * One-off: move the two WCED IP66 weatherproof switched sockets from Circuit
 * Protection to Accessories. Category only — names, prices, SKUs, images,
 * write-ups and ids are unchanged, so /circuit-protection/<id> becomes
 * /accessories/<id> (the old link redirects). Never creates products.
 *
 *   npx tsx scripts/move-sockets-to-accessories.ts            # dry run
 *   npx tsx scripts/move-sockets-to-accessories.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const SKUS = ["WPS213", "WPS113"]; // 2-Gang, 1-Gang

async function main() {
  const rows = await prisma.product.findMany({
    where: { sku: { in: SKUS } },
    select: { id: true, sku: true, category: true, name: true, price: true },
  });
  for (const sku of SKUS) {
    const matches = rows.filter((r) => r.sku === sku);
    if (matches.length !== 1) throw new Error(`Expected one product with SKU ${sku}, found ${matches.length}`);
    const r = matches[0];
    console.log(`${sku} [${r.category}] £${r.price} ${r.id} — ${r.name}`);
    if (r.category !== "CircuitProtection" && r.category !== "Accessory") throw new Error(`${sku} is in ${r.category}`);
  }

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  const { count } = await prisma.product.updateMany({
    where: { sku: { in: SKUS }, category: "CircuitProtection" },
    data: { category: "Accessory" },
  });
  console.log(`Moved ${count} product(s) to Accessories.`);

  // Show them at the end of the accessories grid (2-Gang, then 1-Gang).
  const last = await prisma.product.aggregate({
    where: { category: "Accessory", sku: { notIn: SKUS } },
    _max: { sortOrder: true },
  });
  const base = (last._max.sortOrder ?? 0) + 1;
  for (const [i, sku] of SKUS.entries()) {
    await prisma.product.updateMany({ where: { sku, category: "Accessory" }, data: { sortOrder: base + i } });
    console.log(`${sku} sortOrder → ${base + i}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
