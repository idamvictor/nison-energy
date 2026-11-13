/**
 * One-off: put two "Posts and Mounts.docx" products back to the doc's exact
 * wording (scripts/data/posts-mounts-products.json):
 *   - WA-EV pedestal brand → "WA-EV Charge" (logo alias in brand-logos.ts)
 *   - Pod Point cable bag specs → the doc's Electrical group, unshortened
 * Nothing else (images, prices, other rows) changes.
 *
 *   npx tsx scripts/fix-posts-mounts-wording.ts            # dry run
 *   npx tsx scripts/fix-posts-mounts-wording.ts --commit   # apply
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prisma } from "../src/lib/db";

type Spec = { label: string; value: string; section?: string };
type Item = { sku: string; brand: string; specs: Spec[] };

const COMMIT = process.argv.includes("--commit");
const data = JSON.parse(readFileSync(join(__dirname, "data", "posts-mounts-products.json"), "utf8")) as { products: Item[] };
const bySku = (sku: string) => {
  const item = data.products.find((p) => p.sku === sku);
  if (!item) throw new Error(`${sku} not in the JSON`);
  return item;
};

async function main() {
  const changes = [
    { sku: "VCP-M-SQ-P-SC-WAEV", data: { brand: bySku("VCP-M-SQ-P-SC-WAEV").brand } },
    { sku: "PP-P-190058-1", data: { specs: bySku("PP-P-190058-1").specs } },
  ];

  for (const c of changes) {
    const row = await prisma.product.findFirst({ where: { sku: c.sku }, select: { id: true, brand: true, specs: true } });
    if (!row) throw new Error(`${c.sku} not found`);
    const field = Object.keys(c.data)[0] as "brand" | "specs";
    console.log(`${c.sku} (${row.id}) ${field}\n  before: ${JSON.stringify(row[field])}\n  after:  ${JSON.stringify(c.data[field as keyof typeof c.data])}`);
    if (COMMIT) await prisma.product.update({ where: { id: row.id }, data: c.data });
  }
  console.log(COMMIT ? "Updated." : "Dry run — pass --commit to apply.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
