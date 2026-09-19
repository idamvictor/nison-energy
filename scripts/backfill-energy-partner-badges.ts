/**
 * One-off backfill: set Product.compatibleTariffs from the real "Works with
 * Octopus Energy" / "Works with OVO Energy" badge images embedded in the
 * source spreadsheet's Write-ups sheet (xl/drawings/drawing2.xml), mapped to
 * SKUs via the Chargers sheet's Write-up column. See the plan file for the
 * full derivation — this table is the verified result of that investigation.
 *
 *   npx tsx scripts/backfill-energy-partner-badges.ts            # dry run
 *   npx tsx scripts/backfill-energy-partner-badges.ts --commit    # applies
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

const BOTH = ["Octopus Energy", "OVO Energy"];
const OCTOPUS_ONLY = ["Octopus Energy"];

const badgesBySku: Record<string, string[]> = {
  HV3PROAAUB050T: BOTH,
  HV3PROAAUB075T2: BOTH,
  HV3PROAAUB100T2: BOTH,
  SMNFGT2BL403: BOTH,
  SPRFGT2WG406: BOTH,
  SPRFGSKBG420: BOTH,
  SPRFGSKWG406: BOTH,
  // 2H22TW / 2H22TB / 2H22UW (Zappi 22kW): these two write-up families are
  // deliberately excluded from import (see EXCLUDED_FAMILIES in
  // import-catalogue.ts — cross-assigned write-up references in the source
  // sheet). Left here for completeness; will always report as a MISS below.
  "2H22TW": BOTH,
  "2H22TB": BOTH,
  "2H22UW": BOTH,
  "ZAPPI-3AS07T-G": BOTH,
  "2H07TW": BOTH,
  "2H07TB": BOTH,
  "2H07UB": BOTH,
  "2H07UW": BOTH,
  WAEVEV1i7WIFIS: BOTH,
  OHME0002GB002: OCTOPUS_ONLY,
  "OHME0002GB002-8M": OCTOPUS_ONLY,
  "OHMEX1GB003-BL": OCTOPUS_ONLY,
  "VP-007-STH-W-75": OCTOPUS_ONLY,
  "VP-007-SUH-W-01": OCTOPUS_ONLY,
  "E022-SUH-WG-01": OCTOPUS_ONLY,
};

async function main() {
  let totalMatched = 0;
  for (const [sku, badges] of Object.entries(badgesBySku)) {
    const rows = await prisma.product.findMany({
      where: { sku },
      select: { id: true, name: true },
    });
    if (rows.length === 0) {
      console.log(`MISS  ${sku} — no product found with this SKU`);
      continue;
    }
    totalMatched += rows.length;
    for (const row of rows) {
      console.log(
        `${COMMIT ? "SET" : "DRY"}   ${sku} -> [${badges.join(", ")}]  (${row.name})`,
      );
    }
    if (COMMIT) {
      await prisma.product.updateMany({
        where: { sku },
        data: { compatibleTariffs: badges },
      });
    }
  }
  console.log(
    `\n${COMMIT ? "Updated" : "Would update"} ${totalMatched} product row(s) across ${Object.keys(badgesBySku).length} SKU(s).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
