/**
 * One-off: add the client's "New Products.docx" chargers, copy word for word.
 * Data (titles, SKUs, prices, write-ups, image refs) is in
 * scripts/data/new-products.json, extracted programmatically from the doc.
 *
 *   - 11 new chargers (22kW → Commercial, 7kW → Residential).
 *   - Indra Smart LUX: 7 new colour/length versions in the existing Black
 *     6m's variant group, and the Black 6m (SMNFGT2BL403) takes the doc's
 *     new write-up (its title, SKU and price stay as they are).
 *
 * Images come from the docx's word/media folder (pass its path). Each
 * distinct picture is uploaded once to the media store as JPEG and reused
 * where products share it. Brand logos (NexBlue, NRG Charge) are uploaded
 * too and printed, for src/lib/content/brand-logos.ts.
 *
 * Never overwrites: refuses if any new id or SKU already exists.
 *
 *   npx tsx scripts/add-new-products.ts <docx word/media dir>            # dry run
 *   npx tsx scripts/add-new-products.ts <docx word/media dir> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";
import type { Prisma } from "../src/generated/prisma/client";

type Spec = { label: string; value: string };
type NewProduct = {
  category: "Residential" | "Commercial";
  brand: string;
  connectionType: "Tethered" | "Untethered";
  powerOutput: string;
  cableLength?: string;
  name: string;
  sku: string;
  price: string;
  description: string[];
  features: string[];
  specs: Spec[];
  gallery: string[];
  tariffs: string[];
  warranty: string | null;
  video: string | null;
};
type LuxVariant = { sku: string; colour: string; cableLength: string; price: string; gallery: string[] };
type Data = {
  logos: Record<string, string>;
  products: NewProduct[];
  indraLux: { title: string; description: string[]; features: string[]; specs: Spec[]; warranty: string; variants: LuxVariant[] };
};

const COMMIT = process.argv.includes("--commit");
const mediaDir = process.argv.slice(2).find((a) => !a.startsWith("--"));
const data = JSON.parse(readFileSync(join(__dirname, "data", "new-products.json"), "utf8")) as Data;

const LUX_EXISTING_SKU = "SMNFGT2BL403";
const INSTALL_FEE = "499"; // same as every charger during the installation sale
const SORT_START = 500; // after the existing catalogue

// Same rule as the admin form's slugify(), so a later Save keeps the URL.
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const watchUrl = (embed: string) => `https://www.youtube.com/watch?v=${embed.split("/").pop()}`;

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

  const lux = data.indraLux;
  const existingLux = await prisma.product.findFirst({ where: { sku: LUX_EXISTING_SKU } });
  if (!existingLux) throw new Error(`Existing Indra LUX ${LUX_EXISTING_SKU} not found`);
  const luxGroup = existingLux.variantGroup ?? existingLux.id;

  // Rows to create.
  type Row = Prisma.ProductCreateInput & { _images: string[]; _video?: string };
  const rows: Row[] = data.products.map((p, i) => ({
    id: slugify(p.name),
    category: p.category,
    name: p.name,
    brand: p.brand,
    sku: p.sku,
    colour: "Black",
    cardImage: "",
    active: true,
    featured: false,
    sortOrder: SORT_START + i,
    spec: `${p.powerOutput} · ${p.connectionType}`,
    connectionType: p.connectionType,
    cableLength: p.cableLength ?? null,
    cableLengthOptions: p.category === "Residential" && p.cableLength ? [p.cableLength] : [],
    powerOutput: p.powerOutput,
    price: p.price,
    installFee: INSTALL_FEE,
    compatibleTariffs: p.tariffs,
    description: p.description,
    features: p.features,
    specs: p.specs,
    warranty: p.warranty,
    _images: p.gallery,
    _video: p.video ? watchUrl(p.video) : undefined,
  }));
  lux.variants
    .filter((v) => v.sku !== LUX_EXISTING_SKU)
    .forEach((v, i) => {
      const name = `${lux.title} ${v.cableLength} - ${v.colour}`;
      rows.push({
        id: slugify(name),
        category: "Residential",
        name,
        brand: "Indra",
        sku: v.sku,
        colour: v.colour,
        cardImage: "",
        variantGroup: luxGroup,
        active: true,
        featured: false,
        sortOrder: existingLux.sortOrder + 1 + i,
        spec: existingLux.spec,
        connectionType: "Tethered",
        cableLength: v.cableLength,
        cableLengthOptions: [v.cableLength],
        powerOutput: existingLux.powerOutput,
        price: v.price,
        installFee: INSTALL_FEE,
        compatibleTariffs: existingLux.compatibleTariffs,
        description: lux.description,
        features: lux.features,
        specs: lux.specs,
        warranty: lux.warranty,
        _images: v.gallery,
      });
    });

  // Never overwrite anything.
  const clashes = await prisma.product.findMany({
    where: { OR: [{ id: { in: rows.map((r) => r.id) } }, { sku: { in: rows.map((r) => r.sku as string) } }] },
    select: { id: true, sku: true },
  });
  if (clashes.length) throw new Error(`Already exist (nothing changed): ${clashes.map((c) => `${c.sku} ${c.id}`).join(", ")}`);
  const dupIds = rows.map((r) => r.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupIds.length) throw new Error(`Duplicate ids: ${dupIds.join(", ")}`);

  const luxBlack = lux.variants.find((v) => v.sku === LUX_EXISTING_SKU)!;
  const files = [...new Set([...rows.flatMap((r) => r._images), ...luxBlack.gallery, ...Object.values(data.logos)])];
  for (const f of files) if (!existsSync(join(mediaDir, f))) throw new Error(`Missing image ${f}`);

  for (const r of rows) {
    console.log(
      `${String(r.category).padEnd(11)} ${String(r.sku).padEnd(16)} £${String(r.price).padEnd(7)} ${String(r.connectionType).padEnd(10)} ${r.cableLength ?? ""} ` +
        `imgs=${r._images.length}${r._video ? "+video" : ""} tariffs=[${(r.compatibleTariffs as string[]).join(", ")}] warranty=${r.warranty} — ${r.name}`,
    );
  }
  console.log(`Update ${LUX_EXISTING_SKU} (${existingLux.id}): doc write-up + gallery ${luxBlack.gallery.join(", ")}, group ${luxGroup}`);
  console.log(`${rows.length} to create, ${files.length} distinct images/logos to upload.`);
  if (!COMMIT) {
    console.log("Dry run — pass --commit to upload images and write the products.");
    return;
  }

  const client = s3();
  const url = new Map<string, string>();
  for (const f of files) {
    const body = await sharp(join(mediaDir, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
    const key = `uploads/${randomUUID()}.jpg`;
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: "image/jpeg" }));
    url.set(f, `/api/media/${key}`);
  }
  console.log(`Uploaded ${url.size} images.`);

  for (const { _images, _video, ...row } of rows) {
    const gallery = [..._images.map((f) => url.get(f)!), ...(_video ? [_video] : [])];
    await prisma.product.create({ data: { ...row, cardImage: gallery[0], gallery } });
    console.log(`Created ${row.id}`);
  }

  const blackGallery = luxBlack.gallery.map((f) => url.get(f)!);
  await prisma.product.update({
    where: { id: existingLux.id },
    data: {
      description: lux.description,
      features: lux.features,
      specs: lux.specs,
      warranty: lux.warranty,
      variantGroup: luxGroup,
      cardImage: blackGallery[0],
      gallery: [...blackGallery, ...existingLux.gallery.filter((g) => !blackGallery.includes(g))],
    },
  });
  console.log(`Updated ${existingLux.id}`);

  console.log("Brand logos for src/lib/content/brand-logos.ts:");
  for (const [brand, f] of Object.entries(data.logos)) console.log(`  "${brand}": "${url.get(f)}",`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
