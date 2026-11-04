/**
 * One-off: add the Stormguard EV cable channel to Accessories as one product
 * with two lengths (1000mm / 3000mm — two rows sharing a variantGroup, like
 * the charging cables). Copy is word for word from the client's product doc;
 * the gallery ends with the doc's YouTube video. Creates exactly these two
 * products — refuses if either id or SKU already exists.
 *
 *   npx tsx scripts/add-stormguard-cable-channel.ts            # dry run
 *   npx tsx scripts/add-stormguard-cable-channel.ts --commit   # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";
import { incVatOf } from "../src/lib/pricing-review/types";

const COMMIT = process.argv.includes("--commit");

const TITLE = "Stormguard Heavy Duty EV Cable Channel Surface-Mounted Cross-Pavement Solution – Matt Silver";
const VARIANT_GROUP = "stormguard-heavy-duty-ev-cable-channel-matt-silver";

const description = [
  "The Stormguard Heavy Duty EV Cable Channel is a robust, precision-engineered aluminium pavement channel designed to eliminate trip hazards and provide a compliant route for running electric vehicle charging leads across public footpaths, driveways, and pedestrian walkways. Featuring a 26mm jaw width tailored to house charging cables up to 19mm in diameter, it delivers a flush-fitting conduit that allows pedestrian, pushchair, and wheelchair traffic to traverse smoothly without obstruction.",
  "Manufactured from heavy-duty aluminium that can be cut to length on site, the channel incorporates external ribbed anchoring edges that bond securely into tarmac, concrete, resin, and block paving. Heavy-duty flexible bristles hold the EV cable firmly in place during active charging sessions while effectively sealing the slot to prevent leaves, dirt, and street debris from clogging the channel. Registered under UK Design Numbers 6155494, 6155495, 6155496, and 6155497, it provides a long-lasting, low-maintenance asset for on-street domestic charging.",
  "Under the UK Government’s updated October 2026 cross-pavement EV charging rules (introducing Class F permitted development rights), planning permission has been removed for authorized embedded cable channels. Utilising an approved, surface-mounted flush channel like the Stormguard drastically cuts overall installation expenses—saving homeowners up to £300 in planning application fees and eliminating administrative delays. By integrating directly with local highway authority approvals, it enables drivers without private driveways to legally and safely access low-cost domestic off-peak energy tariffs from their own home wallbox.",
];

const specs = [
  { label: "Max Cable Diameter", value: "19mm" },
  { label: "Jaw Width", value: "26mm" },
  { label: "Cable Retention", value: "Flexible bristles hold the cable in place" },
  { label: "Channel Material", value: "Heavy duty aluminium, can be cut to size" },
  { label: "Surface Grip", value: "Ribbed outer edges for a secure fixing surface" },
  { label: "Debris Protection", value: "Brushes prevent dirt from entering the channel" },
  { label: "Safety", value: "Prevents trip hazards" },
  { label: "Installation", value: "Suitable for most surfaces; fit as per instructions, clean and maintain regularly" },
  { label: "Colour", value: "Matt Silver" },
  { label: "Registered Design Numbers", value: "6155494, 6155495, 6155496, 6155497" },
  { label: "Two Sizes", value: "1000mm x 43mm x 43mm / 3000mm x 43mm x 43mm" },
];

// From the doc, in display order; the YouTube video goes last.
const gallery = [
  "/api/media/uploads/94575468-4e22-4a37-8ab6-daaf6289c1a5.jpg", // channel render with dimensions
  "/api/media/uploads/257e77ab-26b0-4a74-a8de-aacac9e0c777.jpg", // render with cable
  "/api/media/uploads/c569ec2e-4d7e-4548-9da2-6879f83425e4.jpg", // set into block paving
  "/api/media/uploads/436a4375-3e57-4523-bad2-204113ace4bc.jpg", // in use on a driveway
  "/api/media/uploads/1ec7a3a4-0f12-458a-805b-97004aa9ef5b.jpg", // wheelchair crossing it
  "https://www.youtube.com/watch?v=_VFJQsa8i2U",
];

const VARIANTS = [
  { sku: "04CP9051000MS", length: "1000mm", exVat: 32.15 },
  { sku: "04CP9053000MS", length: "3000mm", exVat: 82.36 },
];

// Same rule as the admin form's slugify(), so a later Save keeps these URLs.
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function main() {
  const rows = VARIANTS.map((v) => {
    const name = `${TITLE} – ${v.length}`;
    return { ...v, name, id: slugify(name), price: incVatOf(v.exVat) };
  });

  const clash = await prisma.product.findFirst({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash) throw new Error(`Already exists: ${clash.sku} (${clash.id}) — nothing changed`);

  const last = await prisma.product.aggregate({ where: { category: "Accessory" }, _max: { sortOrder: true } });
  const sortOrder = (last._max.sortOrder ?? 0) + 1;

  for (const r of rows) console.log(`${r.sku}  £${r.exVat} ex VAT → £${r.price.toFixed(2)} inc VAT  ${r.id}`);
  console.log(`${description.length} description paragraphs, ${specs.length} spec rows, ${gallery.length} gallery items, sortOrder ${sortOrder}`);
  if (!COMMIT) {
    console.log("Dry run — pass --commit to create the products.");
    return;
  }

  for (const [index, r] of rows.entries()) {
    await prisma.product.create({
      data: {
        id: r.id,
        category: "Accessory",
        name: r.name,
        brand: "Stormguard",
        sku: r.sku,
        colour: "Matt Silver",
        cardImage: gallery[0],
        gallery,
        variantGroup: VARIANT_GROUP,
        lengthOptions: [r.length],
        active: true,
        featured: false,
        sortOrder: sortOrder + index,
        price: r.price.toFixed(2),
        description,
        specs,
      },
    });
    console.log(`Created ${r.id}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
