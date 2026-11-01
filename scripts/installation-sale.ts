/**
 * Installation sale: standard installation £540 → £499 inc VAT (£450 →
 * £415.83 ex VAT). Only touches products whose installFee is exactly the
 * old (or, with --revert, the new) price — nothing else changes. The
 * struck-through "was" price shown on the site is INSTALL_WAS_PRICE in
 * src/lib/orders/installation-sale.ts.
 *
 *   npx tsx scripts/installation-sale.ts                     # dry run
 *   npx tsx scripts/installation-sale.ts --commit            # 540 → 499
 *   npx tsx scripts/installation-sale.ts --revert --commit   # 499 → 540 (sale over)
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const REVERT = process.argv.includes("--revert");

const [FROM, TO] = REVERT ? ["499", "540"] : ["540", "499"];

async function main() {
  const rows = await prisma.product.findMany({
    where: { installFee: FROM },
    select: { id: true, category: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  const byCategory = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.category]: (acc[r.category] ?? 0) + 1 }), {});
  console.log(`installFee £${FROM} → £${TO}: ${rows.length} products ${JSON.stringify(byCategory)}`);

  if (!COMMIT) {
    console.log("Dry run — pass --commit to apply.");
    return;
  }
  const { count } = await prisma.product.updateMany({ where: { installFee: FROM }, data: { installFee: TO } });
  console.log(`Updated ${count} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
