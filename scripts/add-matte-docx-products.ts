/**
 * One-off: add the 14 Matt:e products from the client's "Matte.docx" to
 * Trade Counter ▸ Circuit Protection, as 17 rows. The MTE/A 3P (40A/100A) and
 * SP-ICxx-SPD (60/80/100A) come in ratings, so each rating is its own row in
 * one variantGroup, shown as one card with a Rating picker.
 * Copy is word for word: scripts/data/matte-docx-products.json is extracted
 * programmatically from the doc. Stored price (inc VAT) = the doc's ex VAT ×
 * 1.2. Images are the doc's embedded pictures.
 *
 *   npx tsx scripts/add-matte-docx-products.ts <docx word/media dir>            # dry run
 *   npx tsx scripts/add-matte-docx-products.ts <docx word/media dir> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";
import { cleanCircuitProtectorFilters } from "../src/lib/catalog/circuit-protector-filters";
import { incVatOf } from "../src/lib/pricing-review/types";

type Spec = { label: string; value: string };
type Item = {
  name: string;
  sku: string;
  exVat: string;
  warranty: string;
  idSuffix?: string;
  variantGroup?: string;
  filters: Record<string, string[]>;
  images: string[];
  description: string[];
  features: string[];
  specs: Spec[];
};

const COMMIT = process.argv.includes("--commit");
const mediaDir = process.argv.slice(2).find((a) => !a.startsWith("--"));
const data = JSON.parse(readFileSync(join(__dirname, "data", "matte-docx-products.json"), "utf8")) as {
  brand: string;
  products: Item[];
};

// Same rule as the admin form's slugify(), so a later Save keeps the URL.
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function s3(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not set");
  }
  return new S3Client({ endpoint, region: process.env.S3_REGION || "auto", credentials: { accessKeyId, secretAccessKey } });
}

async function upload(client: S3Client, body: Buffer) {
  const key = `uploads/${randomUUID()}.jpg`;
  await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: "image/jpeg" }));
  return `/api/media/${key}`;
}

async function main() {
  if (!mediaDir || !existsSync(mediaDir)) throw new Error("Pass the docx's extracted word/media folder");
  for (const p of data.products) {
    for (const f of p.images) if (!existsSync(join(mediaDir, f))) throw new Error(`${p.sku}: missing image ${f}`);
  }

  const last = await prisma.product.aggregate({ where: { category: "CircuitProtection" }, _max: { sortOrder: true } });
  let sort = (last._max.sortOrder ?? 0) + 1;
  const rows = data.products.map((p) => {
    const id = slugify(p.idSuffix ? `${p.name} ${p.idSuffix}` : p.name);
    return { ...p, id, price: incVatOf(Number(p.exVat)), sortOrder: sort++ };
  });
  const dupes = rows.filter((r, i) => rows.findIndex((o) => o.id === r.id) !== i);
  if (dupes.length) throw new Error(`Duplicate ids: ${dupes.map((d) => d.id).join(", ")}`);

  const clash = await prisma.product.findMany({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash.length) throw new Error(`Already exist (nothing changed): ${clash.map((c) => `${c.sku} ${c.id}`).join(", ")}`);

  for (const r of rows) {
    console.log(
      `CREATE ${r.sku.padEnd(24)} £${r.exVat} ex → £${r.price.toFixed(2)} inc  img=${r.images.join("+")}  sort=${r.sortOrder}` +
        `${r.variantGroup ? `  group=${r.variantGroup}` : ""}\n       /circuit-protection/${r.id}`,
    );
  }
  if (!COMMIT) {
    console.log(`Dry run (${rows.length} products) — pass --commit to upload images and create them.`);
    return;
  }

  // Each docx image is uploaded once, even when several rows share it.
  const client = s3();
  const uploaded = new Map<string, string>();
  for (const f of new Set(rows.flatMap((r) => r.images))) {
    const body = await sharp(join(mediaDir, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
    uploaded.set(f, await upload(client, body));
    console.log(`Uploaded ${f} → ${uploaded.get(f)}`);
  }

  // One create at a time (a single transaction times out on the remote DB).
  for (const r of rows) {
    const gallery = r.images.map((f) => uploaded.get(f)!);
    await prisma.product.create({
      data: {
        id: r.id,
        category: "CircuitProtection",
        name: r.name,
        brand: data.brand,
        sku: r.sku,
        colour: "",
        cardImage: gallery[0],
        gallery,
        tagline: null,
        variantGroup: r.variantGroup ?? null,
        warranty: r.warranty,
        filters: cleanCircuitProtectorFilters(r.filters),
        active: true,
        featured: false,
        sortOrder: r.sortOrder,
        price: r.price,
        description: r.description,
        features: r.features,
        specs: r.specs,
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
