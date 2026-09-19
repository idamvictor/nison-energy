/**
 * One-off migration: fold each product's `tagline` into the front of its
 * `description` array, then clear `tagline`. The tagline field was being
 * filled inconsistently during catalogue entry — some products have a real
 * short caption, but many have a full marketing paragraph (up to 766 chars)
 * that belongs in the description, not the one-line slot under the title.
 * The storefront no longer renders `tagline` at all after this — Description
 * tab picks up the content instead.
 *
 *   npx tsx scripts/merge-tagline-into-description.ts            # dry run
 *   npx tsx scripts/merge-tagline-into-description.ts --commit    # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, tagline: true, description: true },
  });

  const toUpdate = products.filter((p) => p.tagline && p.tagline.trim());

  console.log(`Total products: ${products.length}`);
  console.log(`Products with a non-empty tagline to merge: ${toUpdate.length}`);

  let duplicateCount = 0;
  for (const p of toUpdate) {
    const tagline = p.tagline!.trim();
    const alreadyPresent = p.description.some((para) => para.trim() === tagline);
    if (alreadyPresent) duplicateCount++;
    console.log(
      `[${p.id}] tagline(${tagline.length} chars)="${tagline.slice(0, 60)}${tagline.length > 60 ? "…" : ""}"` +
        (alreadyPresent ? "  ⚠ already present in description, will still prepend (see note)" : ""),
    );
  }

  if (duplicateCount > 0) {
    console.log(
      `\n⚠ ${duplicateCount} product(s) already have the tagline text somewhere in description — review before committing.`,
    );
  }

  if (!COMMIT) {
    console.log("\nDry run only — no writes made. Re-run with --commit to apply.");
    return;
  }

  await prisma.$transaction(
    toUpdate.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: {
          description: [p.tagline!.trim(), ...p.description],
          tagline: null,
        },
      }),
    ),
    { timeout: 60000 },
  );

  console.log(`\nCommitted: merged tagline into description for ${toUpdate.length} product(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
