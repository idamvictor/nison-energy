/**
 * One-off import: fill `Product.filters` for the circuit protectors already on
 * the site from the client's "Ocunio_Website_Product_Filters_Import.csv"
 * (approved 2026-10-27).
 *
 * UPDATE only — this never creates products. CSV rows whose SKU isn't already
 * a circuit protector on the site are skipped. WTB5-SET3 (not in the CSV)
 * takes the single terminal blocks' values. Re-running is safe.
 *
 * Usage:
 *   npx tsx scripts/import-circuit-protector-filters.ts "C:/Users/User/Downloads/Ocunio_Website_Product_Filters_Import.csv" [--dry-run]
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";

import { Client } from "pg";

import {
  CIRCUIT_PROTECTOR_FILTERS,
  type CircuitProtectorFilters,
  cleanCircuitProtectorFilters,
} from "../src/lib/catalog/circuit-protector-filters";

/** CSV "Category" → our Product Type value. */
const TYPE: Record<string, string> = {
  "EV Charging Protection": "EV Charger Protection",
  "PME / PEN Fault Detection": "PME Fault Detection",
  "Distribution Boards": "Distribution Boards",
  "Surge Protection": "Surge Protection",
  "Heat Pump Protection": "Heat Pump Protection",
  "Solar PV": "Solar PV Protection",
  Enclosures: "Enclosures & Accessories",
  "Wiring Accessories": "Enclosures & Accessories",
};

/** SKUs on the site but missing from the CSV → the CSV SKU to copy. */
const COPY_FROM: Record<string, string> = { "WTB5-SET3": "WTB5-BR" };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) rows.push([...row, field]);
  return rows.filter((r) => r.length > 1);
}

const list = (v: string | undefined) =>
  (v ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

function toFilters(r: Record<string, string>, unknown: Set<string>): CircuitProtectorFilters {
  const raw: CircuitProtectorFilters = {
    type: list(TYPE[r["Category"]] ?? r["Category"]),
    application: list(r["Application"]),
    supply: list(r["Supply Type"]),
    current: list(r["Current Rating"]),
    installation: list(r["Installation"]),
    curve: list(r["Tripping Curve"]),
    rcdType: list(r["RCD / RCBO Type"]),
    features: [
      r["Surge Protection (SPD)"] === "Yes" && "Surge Protection",
      r["PME / PEN Fault Detection"] === "Yes" && "PME Fault Detection",
      r["Load Management"] === "Yes" && "Load Balancing",
      r["kWh Energy Meter"] === "Yes" && "kWh Meter",
    ].filter((x): x is string => Boolean(x)),
  };
  // Report any CSV value the filter definitions don't know (it would be dropped).
  for (const def of CIRCUIT_PROTECTOR_FILTERS) {
    for (const v of raw[def.key] ?? []) {
      if (!(def.values as readonly string[]).includes(v)) unknown.add(`${def.key}: ${v}`);
    }
  }
  return cleanCircuitProtectorFilters(raw);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file || !existsSync(file)) throw new Error(`Pass the CSV path (got: ${file ?? "nothing"}).`);

  const [header, ...rows] = parseCsv(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const csv = new Map(rows.map((r) => [r[0].trim(), Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""]))]));

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const { rows: products } = await db.query<{ id: string; sku: string | null }>(
      `SELECT id, sku FROM "Product" WHERE category = 'CircuitProtection'`,
    );
    const unknown = new Set<string>();
    const missing: string[] = [];
    let updated = 0;
    for (const p of products) {
      const source = p.sku ? (csv.get(p.sku) ?? csv.get(COPY_FROM[p.sku] ?? "")) : undefined;
      if (!source) {
        missing.push(p.sku ?? p.id);
        continue;
      }
      const filters = toFilters(source, unknown);
      if (!dryRun) {
        // UPDATE only — never INSERT.
        await db.query(`UPDATE "Product" SET filters = $1, "updatedAt" = now() WHERE id = $2`, [
          JSON.stringify(filters),
          p.id,
        ]);
      }
      updated++;
    }
    const onSite = new Set(products.map((p) => p.sku));
    const skipped = [...csv.keys()].filter((sku) => !onSite.has(sku));

    console.log(`${dryRun ? "[dry run] would update" : "Updated"} ${updated} of ${products.length} circuit protectors.`);
    console.log(`Skipped ${skipped.length} CSV row(s) not on the site (no products created): ${skipped.join(", ")}`);
    if (missing.length) console.log(`No CSV data for: ${missing.join(", ")}`);
    if (unknown.size) console.log(`Values not in the filter list (dropped): ${[...unknown].join("; ")}`);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
