/**
 * One-off upload: push the 17 brand wordmark logos into our Prisma Object
 * Store bucket, printing the resulting /api/media/<key> URLs to hardcode
 * into src/lib/content/brand-logos.ts.
 *
 * Mirrors scripts/upload-partner-badges.ts's inline S3 client (that module's
 * server-only uploadImage() helper can't be imported from a plain script).
 *
 *   npx tsx scripts/upload-brand-logos.ts
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

const DIR = "C:\\Users\\User\\Downloads\\produts logo\\";

// Logo filename -> exact brand string as stored on Product.brand (see
// BRAND_PREFIXES in scripts/import-catalogue.ts).
const files: { brand: string; file: string }[] = [
  { brand: "Easee", file: "easee.png" },
  { brand: "Evec", file: "evec.png" },
  { brand: "FastAmps", file: "fastamps.png" },
  { brand: "Hypervolt", file: "hypervolt.png" },
  { brand: "Indra", file: "indra.png" },
  { brand: "Myenergi", file: "myenergy.png" },
  { brand: "Ohme", file: "ohme.png" },
  { brand: "Pod Point", file: "pod point.png" },
  { brand: "Sevadis", file: "sevadis.png" },
  { brand: "SolaX", file: "solax.png" },
  { brand: "Sync Energy", file: "sync energy.png" },
  { brand: "Tesla", file: "tesla.png" },
  { brand: "VCHRGD", file: "VCHRGD.png" },
  { brand: "waEV-charge", file: "waev.png" },
  { brand: "Wottz", file: "wottz.png" },
  { brand: "Zaptec", file: "zaptec.png" },
  { brand: "ZEV", file: "zev.png" },
];

async function main() {
  console.log("export const brandLogos: Record<string, string> = {");
  for (const { brand, file } of files) {
    const buf = readFileSync(DIR + file);
    const key = `uploads/${randomUUID()}.png`;
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: buf,
        ContentType: "image/png",
      }),
    );
    console.log(`  "${brand}": "/api/media/${key}",`);
  }
  console.log("};");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
