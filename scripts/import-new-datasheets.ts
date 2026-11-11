/**
 * One-off import: attach the "New Datasheet" Google Drive folder's PDFs to the
 * new products that had none (approved 2026-11-11). NexBlue Edge / Delta Max
 * have no PDF in the folder and are left without one.
 *
 * Same storage as scripts/import-wced-datasheets.ts: each PDF stored once
 * (de-duplicated by SHA-256) and shared by URL. Products are matched by SKU,
 * and URLs are appended to any datasheets they already have (in MAPPING order:
 * datasheet, then manual/guide, then technical file), so re-running is safe.
 *
 * Usage:
 *   npx tsx scripts/import-new-datasheets.ts "<folder with the PDFs>" [--dry-run]
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { Client } from "pg";

import { MAX_DATASHEETS, MAX_DATASHEET_BYTES, datasheetSafeName } from "../src/lib/media/datasheet";

const VCHRGD_SEVEN = ["E007SUH-01", "E007STH-01"];
const NEXBLUE_POINT_2 = ["NB2670B-BLACK", "NB2677B- Black"];
const NRG_VELOX = ["7kw NON 4G unit", "7kw-4G-unit", "NRG-22KW-4G"];
const INDRA_LUX = [
  "SMNFGT2BL403",
  "SMNFGT2BL404",
  "SMNFGT2GY405",
  "SMNFGT2GY406",
  "SMNFGT2GY407",
  "SMNFGT2GY408",
  "SMNFGT2WH404",
  "SMNFGT2WH405",
];
const LINIAN = ["1LSB1214", "1LSB1214XL", "1LSB1518", "1LSB1518XL", "1LSB1820"];
const WAEV = ["WAEVEV1S7WIFIS", "WAEVEV1I7WIFIS"];

// ─── Document → SKUs (order = order on the product) ──────────────────────────
const MAPPING: [doc: string, skus: string[]][] = [
  ["EN_Easee_One_UK_10523_Productsheet_V2_02.pdf", ["10530"]],
  ["easee_charge_22kw_datasheet.pdf", ["10263"]],
  ["VCHRGD_SEVEN_DATASHEET_V2.5.pdf", VCHRGD_SEVEN],
  ["VCHRGD_SEVEN_INSTALLATION_GUIDE_V2.4.pdf", VCHRGD_SEVEN],
  ["Seven_Technical_File_V2.1_2026_01012026.pdf", VCHRGD_SEVEN],
  ["Nexblue Untethered.pdf", NEXBLUE_POINT_2],
  ["NexBlue_UK_Point 2_Brochure_EN_V2.0.pdf", NEXBLUE_POINT_2],
  ["NRG_B2C_Datasheet_Jan26_proof3.pdf", NRG_VELOX],
  ["NRG-Charge_B2C_Manual_Jan26_WEB.pdf", NRG_VELOX],
  ["Indra Lux Smart_Ocunio Energy.pdf", INDRA_LUX],
  ["Linian _Datasheet_Linian 3.pdf", LINIAN],
  ["waEV-charge Installer Guide 2025.pdf", WAEV],
];

const PDF_MAGIC = Buffer.from("%PDF-");

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const folder = args.find((a) => !a.startsWith("--"));
  if (!folder || !existsSync(folder)) {
    throw new Error(`Pass the folder holding the PDFs (got: ${folder ?? "nothing"}).`);
  }

  // 1. Every document must be present, valid and within limits.
  const present = new Set(readdirSync(folder));
  const problems: string[] = [];
  for (const [doc] of MAPPING) {
    if (!present.has(doc)) {
      problems.push(`missing: ${doc}`);
      continue;
    }
    const bytes = readFileSync(join(folder, doc));
    if (!bytes.subarray(0, 5).equals(PDF_MAGIC)) problems.push(`not a PDF: ${doc}`);
    if (bytes.byteLength > MAX_DATASHEET_BYTES) problems.push(`over 20MB: ${doc}`);
  }
  if (problems.length) throw new Error(`Nothing imported:\n  ${problems.join("\n  ")}`);

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    // Every SKU must match exactly one product.
    const skus = [...new Set(MAPPING.flatMap(([, s]) => s))];
    const { rows: products } = await db.query<{ id: string; sku: string; name: string; datasheets: string[] }>(
      `SELECT id, sku, name, datasheets FROM "Product" WHERE sku = ANY($1)`,
      [skus],
    );
    for (const sku of skus) {
      const n = products.filter((p) => p.sku === sku).length;
      if (n !== 1) problems.push(`${sku}: ${n} products`);
    }
    if (problems.length) throw new Error(`Nothing imported:\n  ${problems.join("\n  ")}`);

    // 2. Store each document once (or reuse an identical stored PDF).
    const urlFor = new Map<string, string>();
    let stored = 0;
    let reused = 0;
    for (const [doc] of MAPPING) {
      const bytes = readFileSync(join(folder, doc));
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const existing = await db.query<{ key: string }>(`SELECT key FROM "DatasheetFile" WHERE sha256 = $1`, [sha256]);
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
      urlFor.set(doc, `/api/media/${key}`);
      console.log(`${existing.rows[0] ? "reuse " : "store "} ${(bytes.byteLength / 1048576).toFixed(1).padStart(5)}MB  ${doc}`);
    }

    // 3. Build each product's new list (existing + new, in MAPPING order, no duplicates), then save once.
    let attached = 0;
    let already = 0;
    const next = new Map(products.map((p) => [p.id, [...p.datasheets]]));
    for (const [doc, docSkus] of MAPPING) {
      const url = urlFor.get(doc)!;
      for (const sku of docSkus) {
        const product = products.find((p) => p.sku === sku)!;
        const list = next.get(product.id)!;
        if (list.includes(url)) {
          already++;
          continue;
        }
        if (list.length >= MAX_DATASHEETS) throw new Error(`${sku} would have more than ${MAX_DATASHEETS} datasheets`);
        list.push(url);
        attached++;
      }
    }
    console.log("");
    for (const p of products) {
      const list = next.get(p.id)!;
      console.log(`${String(list.length).padStart(2)} datasheet(s)  ${p.sku.padEnd(16)} ${p.name}`);
      if (!dryRun && list.length !== p.datasheets.length) {
        await db.query(`UPDATE "Product" SET datasheets = $1, "updatedAt" = now() WHERE id = $2`, [list, p.id]);
      }
    }

    console.log(
      `\n${dryRun ? "[dry run] would store" : "Stored"} ${stored} new PDF(s), reused ${reused}; ` +
        `${dryRun ? "would attach" : "attached"} ${attached} link(s), ${already} already there.`,
    );
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
