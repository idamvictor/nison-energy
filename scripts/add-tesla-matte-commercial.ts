/**
 * One-off: add the "Tesla Wall Connector Gen 3 + Matt:e SP-EVCP-T" bundle as
 * a Commercial charger, copy word for word from the client's product doc.
 * Creates exactly this one product — refuses if the id or SKU already exists.
 * Uploads the doc's two pictures (exported from the docx) to the media store.
 *
 *   npx tsx scripts/add-tesla-matte-commercial.ts <bundle.jpg> <matte.jpg>            # dry run
 *   npx tsx scripts/add-tesla-matte-commercial.ts <bundle.jpg> <matte.jpg> --commit   # apply
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const imagePaths = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const NAME = "Tesla Wall Connector Gen 3 EV Charger – 7kW/22kW with Matt:e PEN Fault Protection (SP-EVCP-T).";
const SKU = "TES-WALLCONNECTOR-G3-PACK";
// Same rule as the admin form's slugify(), so a later Save keeps this URL.
const ID = NAME.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const description = [
  "Tesla Gen 3 Wall Connector with Matt:e SP-EVCP-T | Smart EV Charging & Integrated PEN Fault Protection",
  "The Tesla Gen 3 Wall Connector paired with the Matt:e SP-EVCP-T Connection Centre delivers a high-performance, compliant charging package engineered for Tesla and non-Tesla electric vehicles across domestic, multi-residential, hospitality, and workplace environments. Featuring a lightweight, versatile design for indoor or outdoor mounting, the Wall Connector adapts seamlessly to single-phase (up to 7.4kW) and three-phase (up to 22kW) electrical installations, delivering up to 71 km of range per hour of charge. It comes equipped with an integrated 7.3m Type 2 tethered cable and a built-in Tesla charge port release button on the handle.",
  "Electrical safety and grid compliance are powered by the UK-designed and built Matt:e SP-EVCP-T single-phase monitoring and protection device. Housed in a durable mild-steel IP2X enclosure, it features proprietary O-PEN technology that enables direct connection to a PME earthing facility without installing external earth rods or electrodes. This eliminates disruptive, costly groundworks and prevents the danger of striking underground utilities during installation, while offering an intuitive wire-in/wire-out terminal layout and optional hard-wired CT load management.",
  "Smart functionality is built directly into the hardware, utilizing integrated Wi-Fi for over-the-air firmware updates, dynamic power sharing across multiple interconnected Wall Connectors, and full control via the Tesla app to schedule charging, monitor sessions, and track energy usage in real time. The package offers lasting peace of mind, backed by a 48-month residential / 12-month commercial warranty on the Tesla Wall Connector and a standard 3-year parts warranty on the Matt:e protection unit.",
];

const specs = [
  { label: "Charging Power", value: "Up to 22kW with three-phase grids, up to 71km of range per hour" },
  { label: "Connector & Cable", value: "Type 2 tethered, 7.3m cable, compatible with any Type 2 charge port" },
  { label: "Charge Port Opening", value: "Tesla charge port opens from the connector" },
  { label: "Control & App", value: "Schedule, manage and track charging from the Tesla app" },
  { label: "Connectivity", value: "Wi-Fi connectivity for over-the-air firmware updates" },
  { label: "Power Sharing", value: "Supports multiple Wall Connectors" },
  { label: "Installation", value: "Single or three-phase grids, indoor or outdoor mounting" },
  { label: "Earthing & Protection (Matt:e SP-EVCP-T)", value: "Single-phase monitoring and protection device with built-in PEN fault protection, no earth electrodes required" },
  { label: "Installation Benefits (Matt:e)", value: "Reduces groundworks, removes the risk of striking buried services, simple wire-in wire-out connection" },
  { label: "Load Management (Matt:e)", value: "Optional, with hard-wired CT" },
  { label: "Enclosure & Build (Matt:e)", value: "Mild steel IP2X enclosure, designed and built in the UK" },
  { label: "Part Numbers", value: "TES-WALLCONNECTOR-G3 (Wall Connector), MATT-SP-EVCP-T-W (Matt:e, white)" },
  { label: "Warranty", value: "Tesla Wall Connector: residential personal use 48 months, commercial use 12 months. Matt:e SP-EVCP-T: 3 years (parts)" },
];

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
  if (imagePaths.length !== 2) throw new Error("Pass the bundle image and the Matt:e image paths");

  const clash = await prisma.product.findFirst({ where: { OR: [{ id: ID }, { sku: SKU }] }, select: { id: true } });
  if (clash) throw new Error(`Already exists: ${clash.id} — nothing changed`);

  console.log(`id: ${ID}`);
  console.log(`name: ${NAME}`);
  console.log(`${description.length} description paragraphs, ${specs.length} spec rows, images: ${imagePaths.join(", ")}`);
  if (!COMMIT) {
    console.log("Dry run — pass --commit to upload images and create the product.");
    return;
  }

  const client = s3();
  const gallery: string[] = [];
  for (const path of imagePaths) {
    const key = `uploads/${randomUUID()}.jpg`;
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: readFileSync(path), ContentType: "image/jpeg" }));
    gallery.push(`/api/media/${key}`);
  }
  console.log(`Uploaded: ${gallery.join(", ")}`);

  await prisma.product.create({
    data: {
      id: ID,
      category: "Commercial",
      name: NAME,
      brand: "Tesla",
      sku: SKU,
      colour: "White",
      cardImage: gallery[0],
      gallery,
      active: true,
      featured: false,
      sortOrder: 1,
      spec: "22kW · Tethered",
      connectionType: "Tethered",
      cableLength: "7.3m",
      powerOutput: "22kW",
      price: "659.71",
      installFee: "540",
      description,
      specs,
      warranty: "4 years",
    },
  });
  console.log(`Created ${ID}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
