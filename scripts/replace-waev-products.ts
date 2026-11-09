/**
 * One-off: the client's "New Products (1).docx" ends with a correction —
 * "Remove the existing listing of these products on the website and replace
 * them with these two." Deletes the two current waEV chargers and creates the
 * doc's two, copy word for word (scripts/data/waev-products.json, extracted
 * from the doc). Photos come from the docx's word/media folder and go to the
 * media store. Old URLs redirect via next.config.
 *
 *   npx tsx scripts/replace-waev-products.ts <docx word/media dir>            # dry run
 *   npx tsx scripts/replace-waev-products.ts <docx word/media dir> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";

type Spec = { label: string; value: string };
type WaevProduct = {
  name: string;
  sku: string;
  price: string;
  connectionType: "Tethered" | "Untethered";
  powerOutput: string;
  cableLength?: string;
  description: string[];
  features: string[];
  specs: Spec[];
  gallery: string[];
  warranty: string;
};
type Data = { replaces: string[]; products: WaevProduct[] };

const COMMIT = process.argv.includes("--commit");
const mediaDir = process.argv.slice(2).find((a) => !a.startsWith("--"));
const data = JSON.parse(readFileSync(join(__dirname, "data", "waev-products.json"), "utf8")) as Data;

const INSTALL_FEE = "499"; // same as every charger during the installation sale
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

async function main() {
  if (!mediaDir || !existsSync(mediaDir)) throw new Error("Pass the docx's extracted word/media folder");

  // The two listings being replaced — must each exist exactly once.
  const old = await prisma.product.findMany({
    where: { sku: { in: data.replaces } },
    select: { id: true, sku: true, name: true, sortOrder: true, category: true },
  });
  for (const sku of data.replaces) {
    if (old.filter((o) => o.sku === sku).length !== 1) throw new Error(`Expected one product with SKU ${sku}`);
  }
  const sortOrder = Math.min(...old.map((o) => o.sortOrder));

  const rows = data.products.map((p, i) => ({ ...p, id: slugify(p.name), sortOrder: sortOrder + i }));
  const clash = await prisma.product.findMany({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku) } }] },
    select: { id: true, sku: true },
  });
  if (clash.length) throw new Error(`Already exist (nothing changed): ${clash.map((c) => `${c.sku} ${c.id}`).join(", ")}`);
  for (const f of rows.flatMap((r) => r.gallery)) if (!existsSync(join(mediaDir, f))) throw new Error(`Missing image ${f}`);

  for (const o of old) console.log(`DELETE ${o.sku} [${o.category}] ${o.id}`);
  for (const r of rows) {
    console.log(
      `CREATE ${r.sku} £${r.price} ${r.connectionType} ${r.cableLength ?? ""} imgs=${r.gallery.length} ` +
        `d${r.description.length} f${r.features.length} s${r.specs.length} warranty=${r.warranty} sort=${r.sortOrder} — ${r.name} (${r.id})`,
    );
  }
  if (!COMMIT) {
    console.log("Dry run — pass --commit to upload images and replace the products.");
    return;
  }

  const client = s3();
  const url = new Map<string, string>();
  for (const f of new Set(rows.flatMap((r) => r.gallery))) {
    const body = await sharp(join(mediaDir, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
    const key = `uploads/${randomUUID()}.jpg`;
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: "image/jpeg" }));
    url.set(f, `/api/media/${key}`);
  }
  console.log(`Uploaded ${url.size} images.`);

  await prisma.$transaction([
    ...rows.map((r) => {
      const gallery = r.gallery.map((f) => url.get(f)!);
      return prisma.product.create({
        data: {
          id: r.id,
          category: "Residential",
          name: r.name,
          brand: "waEV-charge",
          sku: r.sku,
          colour: "Black",
          cardImage: gallery[0],
          gallery,
          active: true,
          featured: false,
          sortOrder: r.sortOrder,
          spec: `${r.powerOutput} · ${r.connectionType}`,
          connectionType: r.connectionType,
          cableLength: r.cableLength ?? null,
          cableLengthOptions: r.cableLength ? [r.cableLength] : [],
          powerOutput: r.powerOutput,
          price: r.price,
          installFee: INSTALL_FEE,
          description: r.description,
          features: r.features,
          specs: r.specs,
          warranty: r.warranty,
        },
      });
    }),
    prisma.product.deleteMany({ where: { sku: { in: data.replaces } } }),
  ]);
  for (const r of rows) console.log(`Created ${r.id}`);
  console.log(`Deleted ${data.replaces.join(", ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
