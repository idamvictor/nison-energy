/**
 * One-off correction: scripts/import-catalogue.ts's brand detection used to
 * run on the raw per-row name (`descriptiveName`) instead of the same
 * `rawBase` fallback used for naming — for sub-variant rows whose own name
 * is just a bare colour word ("Grey"/"Red"/"Green", no brand text at all),
 * that produced brand="Unknown" even though sibling colours of the same
 * product were branded correctly. The import script itself is already
 * fixed (brandOf(rawBase) instead of brandOf(descriptiveName)); this script
 * corrects the products already committed to the DB under the old logic,
 * without re-running the full destructive import (which would also wipe
 * the re-hosted images / warranty backfill / featured flags layered on
 * top since).
 *
 *   npx tsx scripts/fix-unknown-brand.ts            # dry run
 *   npx tsx scripts/fix-unknown-brand.ts --commit    # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

// All of these are "Evec"-brand products (vecGO / VecGO / EVEC naming) —
// confirmed against the source spreadsheet's write-up reference for each
// family (see scripts/import-catalogue.ts's BRAND_PREFIXES).
const CORRECT_BRAND = "Evec";

async function main() {
  const rows = await prisma.product.findMany({
    where: { brand: "Unknown" },
    select: { id: true, name: true, brand: true },
  });

  console.log(`Products with brand="Unknown": ${rows.length}`);
  for (const r of rows) {
    console.log(` - ${r.id} ("${r.name}") -> ${CORRECT_BRAND}`);
  }

  if (!COMMIT) {
    console.log("\nDry run only — no writes made. Re-run with --commit to apply.");
    return;
  }

  const result = await prisma.product.updateMany({
    where: { brand: "Unknown" },
    data: { brand: CORRECT_BRAND },
  });
  console.log(`\nCommitted: updated ${result.count} product(s) to brand="${CORRECT_BRAND}".`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
