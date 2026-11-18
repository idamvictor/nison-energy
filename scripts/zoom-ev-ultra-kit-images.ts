/**
 * One-off (2026-11-18): "zoom in" the two EV Ultra install kit thumbnails by
 * trimming the empty white margins off the client's "What's Included" images
 * (all text kept), then swapping them in as the card image + first gallery
 * image — on all 4 lengths of the standard kit and on the Tesla kit.
 *
 *   npx tsx scripts/zoom-ev-ultra-kit-images.ts <dir with 9.jpg 10.jpg>            # dry run
 *   npx tsx scripts/zoom-ev-ultra-kit-images.ts <dir with 9.jpg 10.jpg> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));

const TARGETS = [
  { file: "9.jpg", label: "Standard kit (4 lengths)", where: { variantGroup: "ocunio-ev-ultra-install-kit-spd" }, expectRows: 4 },
  { file: "10.jpg", label: "Tesla kit", where: { id: "tesla-ev-installation-kit-with-pen-protection" }, expectRows: 1 },
];

function s3(): S3Client {
  const { S3_ENDPOINT: endpoint, S3_ACCESS_KEY_ID: accessKeyId, S3_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
  if (!endpoint || !accessKeyId || !secretAccessKey) throw new Error("S3 env vars are not set");
  return new S3Client({ endpoint, region: process.env.S3_REGION || "auto", credentials: { accessKeyId, secretAccessKey } });
}

/** Trim the white margins, add a slim even border back, resize for the web. */
async function zoomed(file: string) {
  const before = await sharp(file).metadata();
  const trimmed = await sharp(file).flatten({ background: "#ffffff" }).trim({ background: "#ffffff", threshold: 10 }).toBuffer();
  const t = await sharp(trimmed).metadata();
  const pad = Math.round((t.width ?? 0) * 0.02);
  const body = await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" })
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return { body, before: `${before.width}×${before.height}`, trimmed: `${t.width}×${t.height}` };
}

async function main() {
  if (!dir) throw new Error("Pass the folder holding 9.jpg and 10.jpg");
  const client = COMMIT ? s3() : null;

  for (const target of TARGETS) {
    const file = join(dir, target.file);
    if (!existsSync(file)) throw new Error(`Missing ${target.file}`);
    const rows = await prisma.product.findMany({ where: target.where, select: { id: true, cardImage: true, gallery: true } });
    if (rows.length !== target.expectRows) throw new Error(`${target.label}: expected ${target.expectRows} rows, found ${rows.length}`);
    const current = rows[0].cardImage;
    if (rows.some((r) => r.cardImage !== current || r.gallery[0] !== current)) {
      throw new Error(`${target.label}: rows don't all start with the same thumbnail — nothing changed`);
    }

    const img = await zoomed(file);
    console.log(`${target.label}: ${target.file} ${img.before} → trimmed ${img.trimmed}; replaces ${current} on ${rows.length} row(s)`);
    if (!client) continue;

    const key = `uploads/${randomUUID()}.jpg`;
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: img.body, ContentType: "image/jpeg" }));
    const url = `/api/media/${key}`;
    for (const r of rows) {
      await prisma.product.update({ where: { id: r.id }, data: { cardImage: url, gallery: [url, ...r.gallery.slice(1)] } });
    }
    console.log(`  uploaded ${url}, updated ${rows.length} row(s)`);
  }
  if (!client) console.log("Dry run — pass --commit to apply.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
