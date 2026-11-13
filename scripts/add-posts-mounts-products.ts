/**
 * One-off: add the 12 products from the client's "Posts and Mounts.docx".
 *   - 4 NRG Charge front fascias  → Accessories ▸ Covers (category Cover, one colour variantGroup)
 *   - 2 posts / pedestals         → Accessories ▸ Mounts & Posts (category Mount)
 *   - 5 Pod Point / Sync cables   → Accessories ▸ Charging Cables (category Accessory, length variantGroups)
 *   - Pod Point cable bag         → Trade Counter ▸ Cable Management (category Cable)
 * Copy is word for word (scripts/data/posts-mounts-products.json). Price is
 * stored inc VAT = the doc's cost price × 1.2. Images are the docx's embedded
 * copies, re-encoded and uploaded to S3.
 *
 *   npx tsx scripts/add-posts-mounts-products.ts <docx word/media dir>            # dry run
 *   npx tsx scripts/add-posts-mounts-products.ts <docx word/media dir> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";
import { cableAttrsToFilters } from "../src/lib/catalog/cable-attrs";
import { categoryRoute } from "../src/lib/catalog/types";

type Spec = { label: string; value: string; section?: string };
type Item = {
  category: "Cover" | "Mount" | "Accessory" | "Cable";
  name: string;
  brand: string;
  sku: string;
  cost: string;
  colour: string;
  length?: string;
  warranty?: string;
  variantGroup?: string;
  images: string[];
  description: string[];
  features: string[];
  specs: Spec[];
};

const COMMIT = process.argv.includes("--commit");
const mediaDir = process.argv.slice(2).find((a) => !a.startsWith("--"));
const data = JSON.parse(readFileSync(join(__dirname, "data", "posts-mounts-products.json"), "utf8")) as { products: Item[] };

// Same rule as the admin form's slugify(), so a later Save keeps the URL.
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const incVat = (cost: string) => Math.round(Number(cost) * 1.2 * 100) / 100;

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

  // sortOrder continues after the current last product in each category.
  const nextSort = new Map<string, number>();
  for (const category of new Set(data.products.map((p) => p.category))) {
    try {
      const last = await prisma.product.aggregate({ where: { category }, _max: { sortOrder: true } });
      nextSort.set(category, (last._max.sortOrder ?? 0) + 1);
    } catch (err) {
      // Cover / Mount before migration 20261113120000 is applied: fine for a dry run only.
      if (COMMIT) throw err;
      console.log(`(${category} isn't in the database yet — apply the migration before --commit)`);
      nextSort.set(category, 1);
    }
  }
  const rows = data.products.map((p) => {
    const sortOrder = nextSort.get(p.category)!;
    nextSort.set(p.category, sortOrder + 1);
    return { ...p, id: slugify(p.name), price: incVat(p.cost), sortOrder };
  });

  const clash = await prisma.product.findMany({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash.length) throw new Error(`Already exist (nothing changed): ${clash.map((c) => `${c.sku} ${c.id}`).join(", ")}`);

  for (const r of rows) {
    console.log(
      `CREATE ${r.category.padEnd(9)} £${r.cost} cost → £${r.price.toFixed(2)} inc  img=${r.images.join("+")}  sort=${r.sortOrder}` +
        `${r.variantGroup ? `  group=${r.variantGroup}` : ""}\n       ${r.name}\n       ${categoryRoute[r.category]}/${r.id}`,
    );
  }
  if (!COMMIT) {
    console.log(`Dry run (${rows.length} products) — pass --commit to upload images and create them.`);
    return;
  }

  // Each docx image is uploaded once, even when several products share it.
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
        category: r.category,
        name: r.name,
        brand: r.brand,
        sku: r.sku,
        colour: r.colour,
        cardImage: gallery[0],
        gallery,
        tagline: null,
        variantGroup: r.variantGroup ?? null,
        warranty: r.warranty ?? null,
        ...(r.category === "Accessory"
          ? { style: "Straight", phase: "Single Phase", lengthOptions: r.length ? [r.length] : [] }
          : {}),
        ...(r.category === "Cable" ? { filters: cableAttrsToFilters({ type: "Cable Management" }) } : {}),
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
