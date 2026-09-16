/**
 * One-off migration: download each product's Google Drive-hosted images and
 * re-upload them to our own Prisma Object Store bucket, updating
 * cardImage/gallery to point at the resulting /api/media/<key> URLs.
 *
 * Mirrors src/lib/media/queries.ts's uploadImage() conventions exactly
 * (uploads/<uuid>.<ext> keys, same allowed types/size cap) but can't import
 * that module directly — it's `server-only`-guarded — so the same
 * S3Client/PutObjectCommand logic is inlined here instead.
 *
 *   npx tsx scripts/rehost-product-images.ts            # dry run — prints only
 *   npx tsx scripts/rehost-product-images.ts --commit    # uploads + updates DB
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function bucket(): string {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error("S3_BUCKET is not set");
  return name;
}

let client: S3Client | undefined;
function s3(): S3Client {
  if (!client) {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error("S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not set");
    }
    client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || "auto",
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

async function reuploadImage(sourceUrl: string): Promise<FetchResult> {
  let res: Response;
  try {
    res = await fetch(sourceUrl);
  } catch (err) {
    return { ok: false, error: `fetch failed: ${(err as Error).message}` };
  }
  if (!res.ok) {
    return { ok: false, error: `fetch returned HTTP ${res.status}` };
  }

  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return { ok: false, error: `unsupported content-type "${contentType}"` };
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0) {
    return { ok: false, error: "empty response body" };
  }
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: `image too large (${buf.byteLength} bytes)` };
  }

  const key = `uploads/${randomUUID()}.${ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: buf,
      ContentType: contentType,
    }),
  );

  return { ok: true, url: `/api/media/${key}` };
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, cardImage: true, gallery: true },
  });

  const distinctUrls = new Set<string>();
  for (const p of products) {
    if (p.cardImage?.includes("googleusercontent.com")) distinctUrls.add(p.cardImage);
    for (const g of p.gallery) {
      if (g.includes("googleusercontent.com")) distinctUrls.add(g);
    }
  }

  console.log(`Products: ${products.length}`);
  console.log(`Distinct Drive image URLs to re-host: ${distinctUrls.size}`);

  if (!COMMIT) {
    console.log("\nDry run only — no fetching/uploading done. Re-run with --commit to apply.");
    return;
  }

  const urlMap = new Map<string, string>();
  const failures: { url: string; error: string }[] = [];

  let i = 0;
  for (const url of distinctUrls) {
    i++;
    const result = await reuploadImage(url);
    if (result.ok) {
      urlMap.set(url, result.url);
      console.log(`[${i}/${distinctUrls.size}] OK   ${url} -> ${result.url}`);
    } else {
      failures.push({ url, error: result.error });
      console.log(`[${i}/${distinctUrls.size}] FAIL ${url} — ${result.error}`);
    }
    await sleep(150);
  }

  console.log(`\nUploaded ${urlMap.size} of ${distinctUrls.size} images.`);
  if (failures.length) {
    console.log(`${failures.length} failed:`);
    failures.forEach((f) => console.log(` - ${f.url}: ${f.error}`));
  }

  console.log("\nUpdating product records...");
  let updated = 0;
  for (const p of products) {
    const newCardImage = p.cardImage ? (urlMap.get(p.cardImage) ?? p.cardImage) : p.cardImage;
    const newGallery = p.gallery.map((g) => urlMap.get(g) ?? g);
    const changed =
      newCardImage !== p.cardImage ||
      newGallery.length !== p.gallery.length ||
      newGallery.some((g, idx) => g !== p.gallery[idx]);
    if (!changed) continue;
    await prisma.product.update({
      where: { id: p.id },
      data: { cardImage: newCardImage, gallery: newGallery },
    });
    updated++;
  }
  console.log(`Updated ${updated} products.`);
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
