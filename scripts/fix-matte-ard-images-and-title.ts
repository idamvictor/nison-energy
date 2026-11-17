/**
 * One-off fixes to the Matte.docx import (requested 2026-11-17):
 *   - ARD-1-32-TP-R-SPD has no image in the doc: give it the 3 photos the
 *     client supplied (open door, closed, wired).
 *   - The doc's image9 belongs to ARD-2-32-TP-R-SPD (after image8), not ARD-1-32.
 *   - MTE/A 3P (40A + 100A rows): new title, and ids re-slugged to match.
 *
 *   npx tsx scripts/fix-matte-ard-images-and-title.ts <dir with 4.webp 5.webp 6.webp>            # dry run
 *   npx tsx scripts/fix-matte-ard-images-and-title.ts <dir with 4.webp 5.webp 6.webp> --commit   # apply
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
const ARD1_PHOTOS = ["4.webp", "5.webp", "6.webp"]; // open door, closed, wired
const MTE_NAME = "Matt:e MTE/A 11-100M1A 3P Single Phase PEN Fault Protection and 40 or 100A MCB";

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function s3(): S3Client {
  const { S3_ENDPOINT: endpoint, S3_ACCESS_KEY_ID: accessKeyId, S3_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
  if (!endpoint || !accessKeyId || !secretAccessKey) throw new Error("S3 env vars are not set");
  return new S3Client({ endpoint, region: process.env.S3_REGION || "auto", credentials: { accessKeyId, secretAccessKey } });
}

async function upload(client: S3Client, file: string) {
  const body = await sharp(file).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
  const key = `uploads/${randomUUID()}.jpg`;
  await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: "image/jpeg" }));
  return `/api/media/${key}`;
}

async function main() {
  if (!dir) throw new Error("Pass the folder holding 4.webp, 5.webp, 6.webp");
  for (const f of ARD1_PHOTOS) if (!existsSync(join(dir, f))) throw new Error(`Missing ${f}`);

  const ard1 = await prisma.product.findFirstOrThrow({ where: { sku: "ARD-1-32-TP-R-SPD" } });
  const ard2 = await prisma.product.findFirstOrThrow({ where: { sku: "ARD-2-32-TP-R-SPD" } });
  const mte = await prisma.product.findMany({ where: { sku: { startsWith: "MTE/A 11-100M1A 3P " } }, orderBy: { sortOrder: "asc" } });
  if (mte.length !== 2) throw new Error(`Expected 2 MTE/A 3P rows, found ${mte.length}`);
  if (ard1.gallery.length !== 1 || ard2.gallery.length !== 1) throw new Error("ARD galleries already changed — nothing done");

  const ids = mte.map((m) => m.id);
  const [items, proposals] = await Promise.all([
    prisma.orderItem.count({ where: { productId: { in: ids } } }),
    prisma.priceProposal.count({ where: { productId: { in: ids } } }),
  ]);
  if (items || proposals) throw new Error(`MTE/A rows have ${items} order items / ${proposals} price proposals — not changing ids`);

  const renames = mte.map((m) => {
    const rating = m.sku!.split(" ").pop()!.toLowerCase(); // "40a" / "100a"
    return { from: m.id, to: slugify(`${MTE_NAME} ${rating}`), oldName: m.name };
  });

  console.log(`ARD-1-32  gallery ${JSON.stringify(ard1.gallery)} → [3 new uploads: ${ARD1_PHOTOS.join(", ")}]`);
  console.log(`ARD-2-32  gallery ${JSON.stringify(ard2.gallery)} → ${JSON.stringify([ard2.gallery[0], ard1.gallery[0]])}`);
  for (const r of renames) console.log(`MTE/A     ${r.from}\n       →  ${r.to}\n          "${r.oldName}" → "${MTE_NAME}"`);
  if (!COMMIT) return console.log("Dry run — pass --commit to apply.");

  const client = s3();
  const photos: string[] = [];
  for (const f of ARD1_PHOTOS) photos.push(await upload(client, join(dir, f)));
  console.log("Uploaded:", photos.join(", "));

  await prisma.product.update({ where: { id: ard2.id }, data: { gallery: [ard2.gallery[0], ard1.gallery[0]] } });
  await prisma.product.update({ where: { id: ard1.id }, data: { gallery: photos, cardImage: photos[0] } });
  for (const r of renames) await prisma.product.update({ where: { id: r.from }, data: { id: r.to, name: MTE_NAME } });
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
