/**
 * One-off upload: push the two energy-partner badge PNGs (Octopus Energy,
 * OVO Energy) into our Prisma Object Store bucket, printing the resulting
 * /api/media/<key> URLs to hardcode into PartnerBadges.
 *
 * Mirrors src/lib/media/queries.ts's uploadImage() conventions (same
 * uploads/<uuid>.<ext> key shape) but inlines the S3 client since that
 * module is `server-only`-guarded — same approach as
 * scripts/rehost-product-images.ts.
 *
 *   npx tsx scripts/upload-partner-badges.ts
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

const files: { label: string; path: string }[] = [
  { label: "Octopus Energy", path: "C:\\Users\\User\\Downloads\\octopus.png" },
  { label: "OVO Energy", path: "C:\\Users\\User\\Downloads\\ovo.png" },
];

async function main() {
  for (const file of files) {
    const buf = readFileSync(file.path);
    const key = `uploads/${randomUUID()}.png`;
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: buf,
        ContentType: "image/png",
      }),
    );
    console.log(`${file.label}: /api/media/${key}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
