/**
 * One-off import: attach the "WCED Datasheet" Google Drive folder's PDFs to the
 * circuit protectors they exactly match (39 products, approved 2026-10-27).
 * Close-match and missing products are deliberately left without one.
 *
 * Same storage as scripts/import-datasheets.ts: each PDF stored once
 * (de-duplicated by SHA-256) and shared by URL. Products are matched by SKU,
 * and the URL is appended to any datasheets they already have, so re-running
 * is safe.
 *
 * Usage:
 *   npx tsx scripts/import-wced-datasheets.ts "<folder with the PDFs>" [--dry-run]
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { Client } from "pg";

import { MAX_DATASHEETS, MAX_DATASHEET_BYTES, datasheetSafeName } from "../src/lib/media/datasheet";

// ─── Document → SKUs ─────────────────────────────────────────────────────────
const MAPPING: [doc: string, skus: string[]][] = [
  ["WME08-HP40C Whitecliffe-Heat-pump-boards.pdf", ["WME08/HP40C"]],
  ["Whitecliffe-Type-B-HP-RCD-data-sheet.pdf", ["WHP240-030"]],
  ["Whitecliffe-WME10-SOL1-data-sheet.pdf", ["WME10/SOL1"]],
  ["Whitecliffe-WMEV Type A EV RCBO kit.pdf", ["WMEV232B", "WMEV240B", "WMEV232C", "WMEV240C"]],
  [
    "Whitecliffe-WMRC40 Type A EV RCBO kit with surge protection.pdf",
    ["WMRC32BSP", "WMRC32CSP", "WMRC40BSP", "WMRC40CSP"],
  ],
  ["WPRC32BSP weatherproof A Type EV RCBO kit.pdf", ["WPRC32BSP", "WPRC32CSP", "WPRC40BSP", "WPRC40CSP"]],
  ["Whitecliffe-WMCUSP4-WRCUSP4-Data-2.pdf", ["WMCUSP440C", "WRCUSP440C"]],
  ["Whitecliffe-WMEPME08-SP.pdf", ["WMEPME08/SP"]],
  ["Whitecliffe-WMEPME10LB-Data-sheet.pdf", ["WMEPME10/LB"]],
  [
    "Whitecliffe-Terminal-Blocks-Data-sheet.pdf",
    ["WTB5-BR", "WTB5-GY", "WTB5-BK", "WTB5-BL", "WTB5-GN", "WTB5-SET3"],
  ],
  ["Whitecliffe-weatherproof-sockets-WPS213-WPS113-WPF13.pdf", ["WPS213", "WPS113", "WPF13"]],
  [
    "Whitecliffe-TPN-boards-Data-sheet.pdf",
    ["WTPN04-125", "WTPN06-125", "WTPN08-125", "WTPN12-125", "WTPN16-125", "WTPN24-125"],
  ],
  [
    "WARB5100C-PME-Data-sheet.pdf",
    ["WARB5100C/PME", "WARB5100C/PMESP", "WARB5100C/PME40R", "WARB5100C/PME40RSP"],
  ],
  ["WMTP28-R40CSP Whitecliffe - 3-phase-PME-fault-detection.pdf", ["WMTP28-R40CSP"]],
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
    // Every SKU must match exactly one circuit protector.
    const skus = MAPPING.flatMap(([, s]) => s);
    const { rows: products } = await db.query<{ id: string; sku: string; datasheets: string[] }>(
      `SELECT id, sku, datasheets FROM "Product" WHERE category = 'CircuitProtection' AND sku = ANY($1)`,
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

    // 3. Attach: append to each product's existing list, skipping duplicates.
    let attached = 0;
    let already = 0;
    for (const [doc, docSkus] of MAPPING) {
      const url = urlFor.get(doc)!;
      for (const sku of docSkus) {
        const product = products.find((p) => p.sku === sku)!;
        if (product.datasheets.includes(url)) {
          already++;
          continue;
        }
        if (product.datasheets.length >= MAX_DATASHEETS) throw new Error(`${sku} already has ${MAX_DATASHEETS} datasheets`);
        if (!dryRun) {
          await db.query(`UPDATE "Product" SET datasheets = $1, "updatedAt" = now() WHERE id = $2`, [
            [...product.datasheets, url],
            product.id,
          ]);
        }
        attached++;
      }
    }

    console.log(
      `\n${dryRun ? "[dry run] would store" : "Stored"} ${stored} new PDF(s), reused ${reused}; ` +
        `${dryRun ? "would attach" : "attached"} to ${attached} product(s), ${already} already had it.`,
    );
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
