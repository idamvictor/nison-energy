/**
 * One-off backfill:
 *  - warranty: extract a real duration string from each product's already-imported
 *    specs/features/description (source data has it, it just never landed in the
 *    dedicated `warranty` column during the original catalogue import).
 *  - installFee: set the flat £540 installer cost (from the source spreadsheet's
 *    "Installer cost" column, never read by the original import) on every
 *    Residential/Commercial product. Accessories are left untouched (null).
 *
 *   npx tsx scripts/backfill-warranty.ts            # dry run — prints only
 *   npx tsx scripts/backfill-warranty.ts --commit    # writes to the DB
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const INSTALL_FEE = 540;

type Spec = { label?: string; value?: string };

function extractWarranty(
  specs: unknown,
  features: string[],
  description: string[],
): { value: string; source: string } | null {
  if (Array.isArray(specs)) {
    for (const raw of specs as Spec[]) {
      if (raw && typeof raw.label === "string" && /^warranty$/i.test(raw.label.trim())) {
        const value = (raw.value ?? "").trim();
        if (value) return { value, source: "specs" };
      }
    }
  }

  for (const line of features) {
    const match = line.match(/(\d+)[\s-]*years?\b.*warranty|warranty.*?(\d+)[\s-]*years?\b/i);
    if (match) {
      const years = match[1] ?? match[2];
      return { value: `${years} years`, source: "features" };
    }
  }

  const descText = description.join(" ");
  const descMatch = descText.match(/(\d+)[\s-]*years?\s+(?:manufacturer\s+)?warranty/i);
  if (descMatch) {
    return { value: `${descMatch[1]} years`, source: "description" };
  }

  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      specs: true,
      features: true,
      description: true,
    },
  });

  const warrantyUpdates: { id: string; warranty: string }[] = [];
  const noWarranty: string[] = [];
  const bySource: Record<string, number> = { specs: 0, features: 0, description: 0 };

  for (const p of products) {
    const found = extractWarranty(p.specs, p.features, p.description);
    if (found) {
      warrantyUpdates.push({ id: p.id, warranty: found.value });
      bySource[found.source] = (bySource[found.source] ?? 0) + 1;
      console.log(`[warranty:${found.source}] ${p.id} -> "${found.value}"`);
    } else {
      noWarranty.push(p.id);
    }
  }

  const installFeeUpdates = products.filter(
    (p) => p.category === "Residential" || p.category === "Commercial",
  );

  console.log(`\nWarranty: ${warrantyUpdates.length}/${products.length} extracted`);
  console.log(
    `  from specs: ${bySource.specs}, features: ${bySource.features}, description: ${bySource.description}`,
  );
  if (noWarranty.length > 0) {
    console.log(`No warranty found for ${noWarranty.length} product(s):`);
    noWarranty.forEach((id) => console.log(`  - ${id}`));
  }

  console.log(
    `\nInstall fee: will set £${INSTALL_FEE} on ${installFeeUpdates.length} Residential/Commercial product(s)`,
  );

  if (!COMMIT) {
    console.log("\nDry run only — no writes made. Re-run with --commit to apply.");
    return;
  }

  await prisma.$transaction(
    [
      ...warrantyUpdates.map((u) =>
        prisma.product.update({ where: { id: u.id }, data: { warranty: u.warranty } }),
      ),
      prisma.product.updateMany({
        where: { category: { in: ["Residential", "Commercial"] } },
        data: { installFee: INSTALL_FEE },
      }),
    ],
    { timeout: 30000 },
  );

  console.log(
    `\nCommitted: ${warrantyUpdates.length} warranty update(s), ${installFeeUpdates.length} install-fee update(s).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
