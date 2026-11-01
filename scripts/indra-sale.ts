/**
 * One-off: put two Indra Smart Pro chargers on sale at the ex-VAT prices in
 * the client's review doc — the same as ticking "On sale" in the admin
 * (compareAtPrice = normal price, price = sale price). Updates by SKU only;
 * skips a product already on sale or not at its expected normal price.
 * End the sale by unticking "On sale" in the admin.
 *
 *   npx tsx scripts/indra-sale.ts            # dry run
 *   npx tsx scripts/indra-sale.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";
import { incVatOf } from "../src/lib/pricing-review/types";

const COMMIT = process.argv.includes("--commit");

const SALES = [
  { sku: "SPRFGT2WG406", normal: 443, saleExVat: 349.16 }, // Smart Pro 7.4kW Tethered 6m - White
  { sku: "SPRFGSKBG420", normal: 483, saleExVat: 339.16 }, // Smart Pro GEN2 Untethered - Black
];

async function main() {
  for (const { sku, normal, saleExVat } of SALES) {
    const row = await prisma.product.findFirst({
      where: { sku },
      select: { id: true, name: true, price: true, compareAtPrice: true },
    });
    if (!row) {
      console.log(`${sku}: not found — skipped`);
      continue;
    }
    const price = Number(row.price);
    if (row.compareAtPrice != null) {
      console.log(`${sku}: already on sale (£${row.compareAtPrice} → £${price}) — skipped`);
      continue;
    }
    if (price !== normal) {
      console.log(`${sku}: price is £${price}, expected £${normal} — skipped`);
      continue;
    }
    const salePrice = incVatOf(saleExVat);
    console.log(`${sku}: £${normal} → £${salePrice} (£${saleExVat} ex VAT) — ${row.name}`);
    if (COMMIT) {
      await prisma.product.update({
        where: { id: row.id },
        data: { price: salePrice.toFixed(2), compareAtPrice: normal.toFixed(2) },
      });
    }
  }
  console.log(COMMIT ? "Applied." : "Dry run — pass --commit to apply.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
