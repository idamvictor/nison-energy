/**
 * One-off: a handful of products had their title edited directly in the
 * admin before the "slug auto-follows title" behavior existed, leaving
 * their id/URL out of sync with the current name. Renames each mismatched
 * product's id to match slugify(name), same rule the admin form now
 * enforces going forward.
 *
 *   npx tsx scripts/backfill-fix-slug-mismatches.ts            # dry run
 *   npx tsx scripts/backfill-fix-slug-mismatches.ts --commit    # applies
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const rows = await prisma.product.findMany({ select: { id: true, name: true } });
  const mismatches = rows
    .map((r) => ({ ...r, expected: slugify(r.name) }))
    .filter((r) => r.id !== r.expected);

  console.log(`Found ${mismatches.length} mismatched product(s):`);
  for (const m of mismatches) {
    console.log(`  ${COMMIT ? "SET" : "DRY"}   "${m.id}" -> "${m.expected}"  (${m.name})`);
  }

  if (!COMMIT) {
    console.log("\nDry run only — no database changes made. Re-run with --commit to apply.");
    return;
  }

  for (const m of mismatches) {
    await prisma.product.update({ where: { id: m.id }, data: { id: m.expected } });
  }
  console.log(`\nCommitted: renamed ${mismatches.length} product(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
