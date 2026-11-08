/**
 * One-off: the client's meter tails doc writes each SKU with a space between
 * the pack code and the size ("MTP1 16.0"); the products were created
 * without it ("MTP116.0"). Restores the doc's spacing. Updates `sku` only —
 * names, prices, ids and URLs are unchanged. Never creates products.
 *
 *   npx tsx scripts/fix-meter-tail-skus.ts            # dry run
 *   npx tsx scripts/fix-meter-tail-skus.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

const RENAME: [from: string, to: string][] = [
  ["MTP116.0", "MTP1 16.0"],
  ["MTP125.0", "MTP1 25.0"],
  ["MTP216.0", "MTP2 16.0"],
  ["MTP225.0", "MTP2 25.0"],
  ["MTP316.0", "MTP3 16.0"],
  ["MTPF325.0", "MTPF3 25.0"],
  ["MTP516.0", "MTP5 16.0"],
  ["MTP525.0", "MTP5 25.0"],
];

async function main() {
  const rows = await prisma.product.findMany({
    where: { sku: { in: RENAME.flatMap(([a, b]) => [a, b]) } },
    select: { id: true, sku: true, category: true, name: true },
  });
  const taken = rows.filter((r) => RENAME.some(([, to]) => to === r.sku));
  if (taken.length) throw new Error(`New SKUs already in use: ${taken.map((r) => r.sku).join(", ")}`);

  for (const [from, to] of RENAME) {
    const matches = rows.filter((r) => r.sku === from);
    if (matches.length !== 1 || matches[0].category !== "Cable") {
      throw new Error(`Expected exactly one Cable product with SKU ${from}, found ${matches.length}`);
    }
    console.log(`${from.padEnd(10)} → ${to.padEnd(11)} ${matches[0].name}`);
  }

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  await prisma.$transaction(RENAME.map(([from, to]) => prisma.product.updateMany({ where: { sku: from, category: "Cable" }, data: { sku: to } })));
  const after = await prisma.product.findMany({ where: { sku: { in: RENAME.map(([, to]) => to) } }, select: { sku: true } });
  console.log(`Updated. Now in database: ${after.map((r) => JSON.stringify(r.sku)).join(", ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
