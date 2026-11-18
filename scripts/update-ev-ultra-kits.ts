/**
 * One-off (2026-11-18): the two EV Ultra install kits (Trade Counter ▸ EV Ultra Install Kit).
 *   - Standard kit: new title, sold in 4 cable lengths (5/10/15/20m). The existing
 *     row (it has an order) becomes the 10m version; 5m/15m/20m are cloned from it.
 *     Client prices are net; stored price = net × 1.2.
 *   - Tesla kit: new title.
 *   - Both: the client's "What's Included" image replaces the current thumbnail.
 *
 *   npx tsx scripts/update-ev-ultra-kits.ts <dir with 9.jpg 10.jpg>            # dry run
 *   npx tsx scripts/update-ev-ultra-kits.ts <dir with 9.jpg 10.jpg> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";
import { cableAttrsToFilters } from "../src/lib/catalog/cable-attrs";
import { incVatOf } from "../src/lib/pricing-review/types";

const COMMIT = process.argv.includes("--commit");
const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));

const STANDARD_ID = "standard-ev-installation-kit-with-integrated-surge-protection-device";
const TESLA_ID = "tesla-ev-installation-kit-with-pen-protection";
const STANDARD_TITLE =
  "Doncaster EV-Ultra 6mm² 3-Core + Cat5e Tuff-Sheath EV Charger Installation Kit with Type A RCBO & SPD (5m–20m)";
const STANDARD_NAME = (length: string) =>
  `Doncaster EV-Ultra 6mm² 3-Core + Cat5e Tuff-Sheath EV Charger Installation Kit with Type A RCBO & SPD – ${length}`;
const TESLA_TITLE =
  "Tesla Wall Connector EV Installation Kit – Doncaster EV-Ultra 6mm² Tuff-Sheath Cable & PEN Fault Protection (RCBO + SPD, 10m)";
const GROUP = "ocunio-ev-ultra-install-kit-spd";
const NET: Record<string, number> = { "5m": 133.67, "10m": 151.17, "15m": 188.67, "20m": 226.17 };

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** The 10m copy, re-worded for another cable length ("10m" / "10 metres"). "1m" tails are untouched. */
const forLength = (text: string, length: string) =>
  text.replace(/\b10m\b/g, length).replace(/\b10 metres\b/g, `${parseInt(length, 10)} metres`);

type Spec = { label: string; value: string; section?: string };

function s3(): S3Client {
  const { S3_ENDPOINT: endpoint, S3_ACCESS_KEY_ID: accessKeyId, S3_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
  if (!endpoint || !accessKeyId || !secretAccessKey) throw new Error("S3 env vars are not set");
  return new S3Client({ endpoint, region: process.env.S3_REGION || "auto", credentials: { accessKeyId, secretAccessKey } });
}

async function upload(client: S3Client, file: string) {
  const body = await sharp(file).resize({ width: 2000, withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
  const key = `uploads/${randomUUID()}.jpg`;
  await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: "image/jpeg" }));
  return `/api/media/${key}`;
}

async function main() {
  if (!dir) throw new Error("Pass the folder holding 9.jpg and 10.jpg");
  for (const f of ["9.jpg", "10.jpg"]) if (!existsSync(join(dir, f))) throw new Error(`Missing ${f}`);

  const standard = await prisma.product.findUniqueOrThrow({ where: { id: STANDARD_ID } });
  const tesla = await prisma.product.findUniqueOrThrow({ where: { id: TESLA_ID } });
  if (standard.variantGroup) throw new Error("Standard kit already has a variant group — already run?");

  const clones = (["5m", "15m", "20m"] as const).map((length) => ({
    length,
    id: slugify(STANDARD_NAME(length)),
    sku: `OCU-EV-KIT-SPD-${length}`,
    name: STANDARD_NAME(length),
    price: incVatOf(NET[length]),
  }));
  const clash = await prisma.product.findMany({
    where: { OR: [{ id: { in: clones.map((c) => c.id) } }, { sku: { in: clones.map((c) => c.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash.length) throw new Error(`Already exist (nothing changed): ${clash.map((c) => `${c.sku} ${c.id}`).join(", ")}`);

  const specs = (standard.specs ?? []) as Spec[];
  console.log(`STANDARD 10m  ${standard.id}`);
  console.log(`  name   "${standard.name}"\n      →  "${STANDARD_NAME("10m")}"`);
  console.log(`  family "${STANDARD_TITLE}"  group=${GROUP}  £${standard.price} → £${incVatOf(NET["10m"]).toFixed(2)} inc`);
  for (const c of clones) {
    const changed = [
      ...standard.description.filter((d) => forLength(d, c.length) !== d),
      ...standard.features.filter((f) => forLength(f, c.length) !== f),
      ...specs.filter((s) => forLength(s.value, c.length) !== s.value).map((s) => s.value),
    ].map((t) => forLength(t, c.length).slice(0, 90));
    console.log(`CREATE ${c.length.padEnd(4)} ${c.sku}  £${c.price.toFixed(2)} inc  /cables/${c.id}`);
    for (const t of changed) console.log(`         ~ ${t}`);
  }
  console.log(`TESLA  ${tesla.id}\n  name   "${tesla.name}"\n      →  "${TESLA_TITLE}"`);
  console.log(`THUMBNAILS  standard ${standard.cardImage} → 9.jpg, tesla ${tesla.cardImage} → 10.jpg`);
  if (!COMMIT) return console.log("Dry run — pass --commit to apply.");

  const client = s3();
  const standardImage = await upload(client, join(dir, "9.jpg"));
  const teslaImage = await upload(client, join(dir, "10.jpg"));
  console.log(`Uploaded ${standardImage}, ${teslaImage}`);

  // The new image takes the old thumbnail's place; the rest of the gallery stays.
  const swap = (gallery: string[], old: string, next: string) => [next, ...gallery.filter((g) => g !== old)];
  const standardGallery = swap(standard.gallery, standard.cardImage, standardImage);

  await prisma.product.update({
    where: { id: standard.id },
    data: {
      name: STANDARD_NAME("10m"),
      tagline: STANDARD_TITLE,
      variantGroup: GROUP,
      filters: cableAttrsToFilters({ type: "EV Ultra Install Kit", length: "10m" }),
      price: incVatOf(NET["10m"]),
      cardImage: standardImage,
      gallery: standardGallery,
    },
  });

  // Same slot as the 10m row — the catalog groups the family and the picker sorts lengths itself.
  const sortOrder = standard.sortOrder;
  for (const c of clones) {
    await prisma.product.create({
      data: {
        id: c.id,
        category: standard.category,
        name: c.name,
        brand: standard.brand,
        sku: c.sku,
        colour: standard.colour,
        cardImage: standardImage,
        gallery: standardGallery,
        tagline: STANDARD_TITLE,
        variantGroup: GROUP,
        filters: cableAttrsToFilters({ type: "EV Ultra Install Kit", length: c.length }),
        warranty: standard.warranty,
        tags: standard.tags,
        datasheets: standard.datasheets,
        active: true,
        featured: false,
        sortOrder,
        price: c.price,
        description: standard.description.map((d) => forLength(d, c.length)),
        features: standard.features.map((f) => forLength(f, c.length)),
        specs: specs.map((s) => ({ ...s, value: forLength(s.value, c.length) })),
      },
    });
    console.log(`Created ${c.id}`);
  }

  await prisma.product.update({
    where: { id: tesla.id },
    data: { name: TESLA_TITLE, cardImage: teslaImage, gallery: swap(tesla.gallery, tesla.cardImage, teslaImage) },
  });
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
