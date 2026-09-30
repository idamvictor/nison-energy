/**
 * One-off import: attach the "Product Datasheet" Google Drive folder's PDFs to
 * their products (mapping approved by the client on 2026-09-29).
 *
 * Each PDF is stored ONCE (de-duplicated by SHA-256, exactly like the admin
 * upload) in the DatasheetFile table and shared by URL across every product
 * that uses it. Re-running is safe: stored files are matched by hash and each
 * product's list is simply set again.
 *
 * Page-1 preview images are optional: if `<folder>/.previews/<file name>.webp`
 * exists it's stored as the card thumbnail (otherwise the card renders page 1
 * with pdf.js on the fly).
 *
 * Usage (download the Drive folder, extract it, then):
 *   npx tsx scripts/import-datasheets.ts "C:/Users/User/Downloads/Product Datasheet" [--dry-run]
 *
 * Standalone (own pg connection) because the app's server-only helpers can't be
 * imported from a plain script.
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { Client } from "pg";

import {
  MAX_DATASHEETS,
  MAX_DATASHEET_BYTES,
  datasheetPreviewKey,
  datasheetSafeName,
} from "../src/lib/media/datasheet";

// ─── Documents ───────────────────────────────────────────────────────────────
const D = {
  vecgoUntethered: "Datasheet_vecGO Untethered Chargers_VEC01-N_VEC02-N.pdf",
  vecgoTethered: "Datasheet_vecGO Tethered_VEC03-N_VEC04-N_1.pdf",
  evecPowerPair: "evec_datasheet_2in1_EDC01.pdf",
  solaxG2: "Solax Smart G2 x1-hac-7p-e_2.pdf",
  solaxHyper: "Solax hyper-ev-charger1.pdf",
  solaxManual: "solax-x1-x3-hac-user-manual-en.pdf",
  solaxWarranty: "Solax_2024_uk_ireland_warranty_terms_conditions.pdf",
  teslaDataset: "Tesla Dataset.pdf",
  teslaManual: "Tesla Manual.pdf",
  teslaTestCert: "Tesla Test Certificate.pdf",
  teslaDoC: "Tesla_declaratation_of_conformity.pdf",
  fastampsA7Datasheet: "FastAmps A7 Gen4 1ph 7kW Datasheet 100225.pdf",
  fastampsA7DoC: "FastAmps A7 Gen4 1ph 7kW Declaration of Conformity 150925.pdf",
  fastampsFlyer: "FastAmps - A4 Gen4 Flyer.pdf",
  fastampsBrochure: "FastAmps - A5 Gen4 Brochure.pdf",
  easeeDatasheet: "Easee One Product Datasheet.pdf",
  easeeInstall: "Easee One Installation Guide.pdf",
  easeeSoC: "Easee - One UK 10523 - Statement of Compliance.pdf",
  ohmeEpodSpec: "Ohme ePod EV Charger Product Specification.pdf",
  ohmeEpodManual: "Ohme ePod Product Manual.pdf",
  ohmeEpodSoC: "Ohme - Home ePod OHMEX1GB003 - Statement of Compliance.pdf",
  ohmeHomeProManual: "Ohme Home Pro EV Charger Product Manual.pdf",
  ohmeHomeProSoC: "Ohme - Home Pro models - Statement of Compliance.pdf",
  zappiGloDatasheet: "Myenergi Gold Technical Data Sheet.pdf",
  zappiUserManual: "MyEnergi EV Charger User Manual.pdf",
  zappiInstallManual: "MyEnergi EV Charger Installation Manual.pdf",
  zappiSoC: "Myenergi - ZAPPI G suffix models - Statement of Compliance.pdf",
  hypervoltCatalogue: "Hyervolt Catalogue Page.pdf",
} as const;

// ─── Product → documents (display order) ─────────────────────────────────────
const zappiCommon = [D.zappiUserManual, D.zappiInstallManual, D.zappiSoC];
const solax = [D.solaxG2, D.solaxHyper, D.solaxManual, D.solaxWarranty];
const fastamps = [D.fastampsA7Datasheet, D.fastampsA7DoC, D.fastampsFlyer, D.fastampsBrochure];

const MAPPING: [productIds: string[], docs: string[]][] = [
  [
    [
      "evec-vecgo-2-0-7-4kw-ev-charger-type-1-type-2-single-phase-untethered-vec01-n-black",
      "vecgo-2-0-7-4kw-ev-charger-type-1-type-2-single-phase-untethered-vec01-n-green",
      "vecgo-2-0-7-4kw-ev-charger-type-1-type-2-single-phase-untethered-vec01-n-grey",
      "vecgo-2-0-7-4kw-ev-charger-type-1-type-2-single-phase-untethered-vec01-n-red",
      // Commercial 22kW untethered — VEC02-N, covered by the same datasheet.
      "evec-vecgo-22kw-untethered-ev-charger-black",
      "evec-vecgo-22kw-untethered-ev-charger-green",
      "evec-vecgo-22kw-untethered-ev-charger-grey",
      "evec-vecgo-22kw-untethered-ev-charger-red",
    ],
    [D.vecgoUntethered],
  ],
  [
    [
      "evec-vecgo-2-0-7-4kw-ev-charger-type-2-single-phase-tethered-black",
      "vecgo-2-0-7-4kw-ev-charger-type-2-single-phase-tethered-vec03-n-green",
      "vecgo-2-0-7-4kw-ev-charger-type-2-single-phase-tethered-vec03-n-grey",
      "vecgo-2-0-7-4kw-ev-charger-type-2-single-phase-tethered-vec03-n-red",
    ],
    [D.vecgoTethered],
  ],
  [["evec-vecgo-7-4-kw-duo-socketed-with-5m-cable-charge-two-cars-together-tethered-black"], [D.evecPowerPair]],
  [["solax-smart-7-2kw-ev-charger-g2-tethered", "solax-smart-three-phase-22kw-ev-charger-g2-tethered"], solax],
  [
    ["tesla-7kw-22kw-type-2-tethered-wall-connector-ev-charger-gen-3"],
    [D.teslaDataset, D.teslaManual, D.teslaTestCert, D.teslaDoC],
  ],
  [["fastamps-7-4kw-alpha7-gen4-tethered-ev-charger-black", "fastamps-7-4kw-alpha7-gen4-untethered-ev-charger-black"], fastamps],
  [["easee-one-7-4-kw-smart-ev-charger-tethered-black"], [D.easeeDatasheet, D.easeeInstall, D.easeeSoC]],
  [["ohme-epod-ev-charger-7-4-kw-untethered-ev-charger-black"], [D.ohmeEpodSpec, D.ohmeEpodManual, D.ohmeEpodSoC]],
  [
    ["ohme-home-pro-7-4kw-type-2-tethered-ev-charger-5m-black", "ohme-home-pro-7-4kw-type-2-tethered-ev-charger-8m-black"],
    [D.ohmeHomeProManual, D.ohmeHomeProSoC],
  ],
  [["myenergi-zappi-glo-7kw-type-2-tethered-ev-charger-black"], [D.zappiGloDatasheet, ...zappiCommon]],
  [
    [
      "myenergi-zappi-smart-7kw-type-2-tethered-ev-charger-black",
      "myenergi-zappi-smart-7kw-type-2-tethered-ev-charger-white",
      "myenergi-zappi-smart-7kw-type-2-untethered-ev-charger-black",
      "myenergi-zappi-smart-7kw-type-2-untethered-ev-charger-white",
      "myenergi-zappi-ev-charger-smart-22kw-type-2-tethered-multiphase-black",
      "myenergi-zappi-ev-charger-smart-22kw-type-2-tethered-multiphase-white",
      "myenergi-zappi-ev-charger-smart-22kw-type-2-untethered-multiphase-black",
      "myenergi-zappi-ev-charger-smart-22kw-type-2-untethered-multiphase-white",
    ],
    zappiCommon,
  ],
  [
    [
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-5m-black",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-5m-space-grey",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-5m-white",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-7-5m-black",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-7-5m-space-grey",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-7-5m-white",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-10m-black",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-10m-space-grey",
      "hypervolt-home-pro-3-tethered-7kw-ev-charger-10m-white",
    ],
    [D.hypervoltCatalogue],
  ],
];

const PDF_MAGIC = Buffer.from("%PDF-");

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const folder = args.find((a) => !a.startsWith("--"));
  if (!folder || !existsSync(folder)) {
    throw new Error(`Pass the extracted Drive folder path (got: ${folder ?? "nothing"}).`);
  }

  // 1. Every mapped document must be present, valid and within limits — check
  //    them all before touching the database.
  const present = new Set(readdirSync(folder));
  const allDocs = [...new Set(Object.values(D))];
  const problems: string[] = [];
  for (const doc of allDocs) {
    if (!present.has(doc)) {
      problems.push(`missing: ${doc}`);
      continue;
    }
    const bytes = readFileSync(join(folder, doc));
    if (!bytes.subarray(0, 5).equals(PDF_MAGIC)) problems.push(`not a PDF: ${doc}`);
    if (bytes.byteLength > MAX_DATASHEET_BYTES) problems.push(`over 20MB: ${doc}`);
  }
  for (const [ids, docs] of MAPPING) {
    if (docs.length > MAX_DATASHEETS) problems.push(`too many docs for ${ids[0]}`);
  }
  if (problems.length) throw new Error(`Nothing imported:\n  ${problems.join("\n  ")}`);

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    // Every mapped product must exist.
    const productIds = MAPPING.flatMap(([ids]) => ids);
    const { rows: found } = await db.query<{ id: string }>(
      `SELECT id FROM "Product" WHERE id = ANY($1)`,
      [productIds],
    );
    const missing = productIds.filter((id) => !found.some((r) => r.id === id));
    if (missing.length) throw new Error(`Unknown product ids:\n  ${missing.join("\n  ")}`);

    // 2. Store each document once (or reuse an identical stored PDF).
    const urlFor = new Map<string, string>();
    let stored = 0;
    let reused = 0;
    for (const doc of allDocs) {
      const bytes = readFileSync(join(folder, doc));
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const existing = await db.query<{ key: string }>(
        `SELECT key FROM "DatasheetFile" WHERE sha256 = $1`,
        [sha256],
      );
      let key = existing.rows[0]?.key;
      if (key) {
        reused++;
      } else {
        key = `datasheets/${randomUUID()}/${datasheetSafeName(doc)}.pdf`;
        stored++;
        if (!dryRun) {
          await db.query(
            `INSERT INTO "DatasheetFile" (key, "contentType", bytes, sha256, "fileName", size)
             VALUES ($1, 'application/pdf', $2, $3, $4, $5)`,
            [key, bytes, sha256, doc, bytes.byteLength],
          );
        }
      }
      // Optional pre-rendered page-1 preview for the card thumbnail.
      const previewPath = join(folder, ".previews", `${basename(doc)}.webp`);
      if (!dryRun && existsSync(previewPath)) {
        const preview = readFileSync(previewPath);
        await db.query(
          `INSERT INTO "DatasheetFile" (key, "contentType", bytes, size)
           VALUES ($1, 'image/webp', $2, $3) ON CONFLICT (key) DO NOTHING`,
          [datasheetPreviewKey(key), preview, preview.byteLength],
        );
      }
      urlFor.set(doc, `/api/media/${key}`);
      console.log(`${existing.rows[0] ? "reuse " : "store "} ${(bytes.byteLength / 1048576).toFixed(1).padStart(5)}MB  ${doc}`);
    }

    // 3. Attach: set each product's datasheet list (display order as mapped).
    let attached = 0;
    for (const [ids, docs] of MAPPING) {
      const urls = docs.map((d) => urlFor.get(d)!);
      for (const id of ids) {
        if (!dryRun) {
          await db.query(`UPDATE "Product" SET datasheets = $1, "updatedAt" = now() WHERE id = $2`, [urls, id]);
        }
        attached++;
      }
    }

    console.log(
      `\n${dryRun ? "[dry run] would store" : "Stored"} ${stored} new PDF(s), reused ${reused}; ` +
        `${dryRun ? "would attach" : "attached"} documents to ${attached} product(s).`,
    );
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
