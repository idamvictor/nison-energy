/**
 * One-off: add the 5 LINIAN SuperClip cable fixings from the client's
 * "Ocunio_Energy_LINIAN_SuperClip_CT.docx" under Trade Counter ▸ Cable
 * Management (Cable category, type "Cable Management"). Copy is word for word
 * (scripts/data/superclip-products.json, extracted from the doc). The clip
 * photo + boxed-pack photo go on every product; the LINIAN logo is uploaded
 * too and its URL printed for src/lib/content/brand-logos.ts.
 *
 *   npx tsx scripts/add-superclip-products.ts <docx word/media dir>            # dry run
 *   npx tsx scripts/add-superclip-products.ts <docx word/media dir> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";
import { cableAttrsToFilters } from "../src/lib/catalog/cable-attrs";
import { exVatOf } from "../src/lib/pricing-review/types";

type Spec = { label: string; value: string; section?: string };
type Clip = {
  name: string;
  sku: string;
  exVat: string;
  incVat: string;
  description: string[];
  features: string[];
  specs: Spec[];
};
type Data = { brand: string; logo: string; gallery: string[]; products: Clip[] };

const COMMIT = process.argv.includes("--commit");
const mediaDir = process.argv.slice(2).find((a) => !a.startsWith("--"));
const data = JSON.parse(readFileSync(join(__dirname, "data", "superclip-products.json"), "utf8")) as Data;

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

async function upload(client: S3Client, body: Buffer, ext: "jpg" | "png") {
  const key = `uploads/${randomUUID()}.${ext}`;
  await client.send(
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: ext === "png" ? "image/png" : "image/jpeg" }),
  );
  return `/api/media/${key}`;
}

async function main() {
  if (!mediaDir || !existsSync(mediaDir)) throw new Error("Pass the docx's extracted word/media folder");
  for (const f of [data.logo, ...data.gallery]) if (!existsSync(join(mediaDir, f))) throw new Error(`Missing image ${f}`);

  // The doc's inc VAT price is stored; the site must show the doc's ex VAT price.
  for (const p of data.products) {
    const shown = exVatOf(Number(p.incVat)).toFixed(2);
    if (shown !== p.exVat) throw new Error(`${p.sku}: £${p.incVat} inc VAT shows £${shown} ex VAT, doc says £${p.exVat}`);
  }

  const last = await prisma.product.aggregate({ where: { category: "Cable" }, _max: { sortOrder: true } });
  const start = (last._max.sortOrder ?? 0) + 1;
  const rows = data.products.map((p, i) => ({ ...p, id: slugify(p.name), sortOrder: start + i }));
  const clash = await prisma.product.findMany({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash.length) throw new Error(`Already exist (nothing changed): ${clash.map((c) => `${c.sku} ${c.id}`).join(", ")}`);

  for (const r of rows) {
    console.log(
      `CREATE ${r.sku.padEnd(11)} £${r.exVat} ex / £${r.incVat} inc  d${r.description.length} f${r.features.length} s${r.specs.length} sort=${r.sortOrder}\n` +
        `       ${r.name}\n       /cables/${r.id}`,
    );
  }
  if (!COMMIT) {
    console.log("Dry run — pass --commit to upload images and create the products.");
    return;
  }

  const client = s3();
  const gallery: string[] = [];
  for (const f of data.gallery) {
    gallery.push(await upload(client, await sharp(join(mediaDir, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer(), "jpg"));
  }
  const logo = await upload(client, await sharp(join(mediaDir, data.logo)).png().toBuffer(), "png");
  console.log(`Gallery: ${gallery.join(", ")}`);
  console.log(`LOGO ${data.brand}: ${logo}`);

  // One create at a time (a single transaction times out on the remote DB).
  for (const r of rows) {
    await prisma.product.create({
        data: {
          id: r.id,
          category: "Cable",
          name: r.name,
          brand: data.brand,
          sku: r.sku,
          colour: "",
          cardImage: gallery[0],
          gallery,
          tagline: null,
          filters: cableAttrsToFilters({ type: "Cable Management" }),
          active: true,
          featured: false,
          sortOrder: r.sortOrder,
          price: r.incVat,
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
