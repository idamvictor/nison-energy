/**
 * One-off migration: replace the placeholder catalog (prisma/seed-products.ts,
 * 23 rows) with real data from the "Ocunio Energy - Master Product Catalogue"
 * spreadsheet. See the approved plan for the full rationale (pricing formula,
 * category classification, exclusions).
 *
 *   npx tsx scripts/import-catalogue.ts             # dry run — prints only
 *   npx tsx scripts/import-catalogue.ts --commit     # deletes old + inserts new
 *   npx tsx scripts/import-catalogue.ts --backfill   # non-destructive: sku + price columns only
 *   npx tsx scripts/import-catalogue.ts --add-tesla [--commit]  # additive: create just the
 *                                                                 2 newly-fixed Tesla products
 *   npx tsx scripts/import-catalogue.ts --add-myenergi-22kw [--commit]  # additive: create just
 *                                                                 the 4 newly-fixed Zappi 22kW products
 *   npx tsx scripts/import-catalogue.ts --add-waev-wifi [--commit]  # additive: create just the
 *                                                                 1 newly-fixed waEV EV1S product
 *   npx tsx scripts/import-catalogue.ts --add-easee [--commit]  # additive: create just the
 *                                                                 2 newly-unexcluded Easee products
 */
import "dotenv/config";
import XLSX from "xlsx";

import { prisma } from "../src/lib/db";
import type { ProductCategory } from "../src/generated/prisma/client";

const XLSX_PATH =
  "C:/Users/User/Downloads/Ocunio Energy - Master Product Catalogue_1.xlsx";

const COMMIT = process.argv.includes("--commit");
// Non-destructive: updates only the `sku`/`price` columns on already-existing
// products (matched by the same deterministic `id` this script already
// produces), instead of the full deleteMany+createMany replace. Used to
// backfill corrections onto the 124 products already live without disturbing
// the re-hosted images / warranty / install-fee / brand data layered on top
// since the original import. `--backfill-sku` kept as an alias for the first
// run of this flag (SKU-only) — both now do the same full backfill.
const BACKFILL = process.argv.includes("--backfill") || process.argv.includes("--backfill-sku");
// Additive: create only the 2 newly-fixed Tesla products (see ROW_FIXES /
// FAMILY_CATEGORY above — identified by brand, since Tesla is brand-new to
// the catalogue), leaving every other already-imported product completely
// untouched — unlike --commit, which replaces the whole catalogue.
const ADD_TESLA = process.argv.includes("--add-tesla");
// Additive: create only the 4 newly-fixed Myenergi Zappi 22kW Multiphase
// products (see the row-16 fix / EXCLUDED_FAMILIES / FAMILY_CATEGORY above —
// identified by SKU prefix, since "2H22" is unique to these 4 rows and
// distinct from the already-live 7kW residential Zappi chargers' "2H07"
// SKUs), leaving every other already-imported product untouched.
const ADD_MYENERGI_22KW = process.argv.includes("--add-myenergi-22kw");
// Additive: create only the 1 newly-fixed waEV-charge EV1S product (see the
// ROW_FIXES / CONTENT_FIXES / FAMILY_CATEGORY entries above — identified by
// its unique SKU), leaving every other already-imported product untouched.
const ADD_WAEV_WIFI = process.argv.includes("--add-waev-wifi");
// Additive: create only the 2 newly-unexcluded Easee "Charge Max" / "Charge
// 22kW" products (see EXCLUDED_FAMILIES above — identified by their unique
// SKUs), leaving every other already-imported product untouched.
const ADD_EASEE = process.argv.includes("--add-easee");

// ─── Column indices (Chargers sheet) ────────────────────────────────────────
const COL = {
  NAME: 0,
  SKU: 1,
  NET_PRICE: 3,
  MARKUP: 4,
  WRITEUP: 16,
  PHOTO_START: 17,
  PHOTO_END: 28,
};

// ─── Row-level corrections — known-bad cells in specific rows, fixed by SKU
// rather than guessed at. Applied right after the sheet is read, before any
// grouping/exclusion logic runs.
const ROW_FIXES: Record<string, { name?: string; writeup?: string }> = {
  // Row 20: product name was pasted twice into one cell.
  "1529455-02-D": {
    name: "Tesla 7kW/22kW Type 2 Tethered Wall Connector EV Charger (Gen 3)",
  },
  // Row 21: Write-up column wrongly points at the Wall Connector's write-up
  // (row 20's) instead of its own — its real write-up exists separately at
  // Write-ups row 1239, just orphaned because nothing referenced it.
  "SP-EVCP-R": {
    writeup: "Tesla Matt:e Single Phase Monitoring and Protection Unit with built in RCBO",
  },
  // Row 14: this family's head row states no colour at all in its name
  // (unlike its sibling row 15 "Black"), so colourOf() silently falls back
  // to its "Black" default — colliding with row 15's explicit "Black" and
  // losing this row entirely. Its SKU suffix ("...TW") and the sibling
  // 22kW Untethered family's parallel W/B SKU pair (2H22UW/2H22UB) both
  // confirm this row is the White variant.
  "2H22TW": {
    name: "Myenergi Zappi EV Charger Smart 22kW Type 2 Tethered Multiphase - White",
  },
  // Row 67 ("waEV-charge EV Smart 7.4kW Charger Tethered 5m with WiFi"):
  // Write-up column is blank in the source — no heading anywhere in the
  // Write-ups sheet references this SKU (confirmed by search), unlike every
  // other product. Also mislabeled "Tethered 5m" in its own Name cell even
  // though it's genuinely untethered (no integrated cable) — real content
  // supplied separately (see CONTENT_FIXES) explicitly says "charger
  // supplied without a cable," and the "5m" is a leftover artifact from
  // copying the Tethered EV1i row's name template. Corrected name drops the
  // wrong "5m" and fixes Tethered -> Untethered; write-up self-references
  // the corrected name so this row forms its own single-row family (no
  // matching heading exists, so CONTENT_FIXES supplies the real content
  // directly instead of relying on heading/paragraph parsing).
  "WAEVEV17WIFI": {
    name: "waEV-charge EV Smart 7.4kW Charger Untethered with WiFi",
    writeup: "waEV-charge EV Smart 7.4kW Charger Untethered with WiFi",
  },
};

// Spec-table values to normalise into the site's plain "X years" warranty
// format, keyed by family key + spec label — the source wording for these
// two write-ups is verbose/mixed (residential vs commercial durations)
// rather than the clean "X years" every other write-up already uses.
const SPEC_VALUE_FIXES: Record<string, Record<string, string>> = {
  "Tesla 7kW/22kW Type 2 Tethered Wall Connector EV Charger (Gen 3)": {
    Warranty: "4 years",
  },
  "Tesla Matt:e Single Phase Monitoring and Protection Unit with built in RCBO": {
    Warranty: "3 years",
  },
};

// Full write-up content for products with no matching heading anywhere in
// the Write-ups sheet (confirmed by search) — supplied directly rather than
// parsed from spreadsheet paragraphs. Applied to the built product after
// normal construction, keyed by SKU.
const CONTENT_FIXES: Record<
  string,
  {
    description: string[];
    features: string[];
    specs: { label: string; value: string }[];
  }
> = {
  "WAEVEV17WIFI": {
    description: [
      "Discover the waEV-charge EV1S Smart EV Charger. Untethered 7.4kW/22kW IP65 wallbox featuring ev.energy app control, direct solar inverter integration, and Tap Electric monetisation.",
      "The waEV-charge EV1S EV Charger is a high-performance, future-proof smart charging solution built with quality, electrical safety, and cutting-edge EV technology at its core. Engineered for both single-phase (7.4kW) and three-phase (22kW) supplies, this unit features a universal untethered Type 2 socket, providing drivers with complete flexibility to use their preferred charging cable. Housed in a robust, IP65-certified weatherproof enclosure, the EV1S is designed to endure a lifetime of daily use across demanding indoor and outdoor domestic or commercial environments.",
      "Designed for maximum eco-efficiency and cost reduction, the charger integrates seamlessly with the industry-leading ev.energy app to enable direct pairing with popular solar inverters, delivering exceptionally accurate solar tracking and zero-carbon charging from self-generated power. Built-in smart tariff integration automatically shifts charging sessions to off-peak hours when electricity prices are lowest, while a secure socket-locking mechanism restricts access strictly to authorized users to prevent unauthorized charging and cable tampering.",
      "Connectivity is comprehensive and versatile, featuring built-in Wi-Fi, Bluetooth, and hardwired Ethernet to ensure stable communication and real-time charging insights at all times.",
      "For commercial hosts and property owners looking to monetize their parking infrastructure, integrated compatibility with Tap Electric allows you to take complete control of your charge points, manage tariffs, and boost your revenue effortlessly through flexible, app-based public or guest management.",
    ],
    features: [
      "EV1S EV charger — 7kW/22kW options",
      "Powered by ev.energy scheduling and analytics",
      "Solar charging integration with ev.energy",
      "RFID secure charging, 2 cards included",
      "Use your own charging cable",
      "OCPP 1.6J for managed commercial charging",
      "WiFi, Bluetooth, and LAN connectivity",
      "Compatible with all Octopus and OVO tariffs",
      "PEN protection, no earth rod required",
    ],
    specs: [
      {
        label: "Charging Power",
        value:
          "7kW at 32A 1 phase (25-30 miles/hr); 11/22kW at 32A 3 phase (70-90 miles/hr); up to 7x faster than a 3-pin plug",
      },
      {
        label: "Connector",
        value:
          "IEC62196-2 (Type 2) as standard, SAE J1772 (Type 1) optional, charger supplied without a cable",
      },
      {
        label: "Connectivity & Integration",
        value:
          "OCPP 1.6J, LAN (RFID Edition), WiFi & Bluetooth (WiFi Edition), 5G (Plug & Play), RFID NFC / ISO 14443",
      },
      {
        label: "Smart Features & Tariff Compatibility",
        value:
          "MID smart meter, solar integration (CT), OCPP 2.0, ISO15118 V2G plug & charge functionality, compatible with all Octopus and OVO tariffs",
      },
      { label: "Compatibility", value: "Compatible with all plug-in vehicle brands" },
      {
        label: "Protection",
        value:
          "PEN protection (no earth rod required), integrated 6mA DC protection (RDC-DD), UVP, OVP, SPD, ground fault protection, OCP, OTP, control pilot fault protection",
      },
      { label: "Certifications", value: "TUV CE & UKCA" },
      { label: "Warranty", value: "3 years" },
    ],
  },
};

// ─── Families to exclude — corrupted source data, not guessed at ───────────
// (The Easee "Charge Max" / "Charge 22kW" pair once lived here too, flagged
// as suspected write-up cross-assignment — re-verified against the raw
// sheet's embedded "SKU:" lines and confirmed both rows already point at
// their own genuine write-up, just worded differently from their own Name
// cell. Un-excluded; see FAMILY_CATEGORY below, which already had the right
// classification waiting from the original approved plan.)
const EXCLUDED_FAMILIES = new Set<string>([]);

// ─── Family -> category (per the approved plan's explicit classification) ──
const FAMILY_CATEGORY: Record<string, ProductCategory> = {
  "Hypervolt Home Pro 3 Tethered 7kw EV Charger 5m  - Black": "Residential",
  "Hypervolt Home Pro 3 Tethered 7kw EV Charger 5m  - Space Grey": "Residential",
  "Hypervolt Home Pro 3 Tethered 7kw EV Charger 5m  - White": "Residential",
  "Myenergi Zappi Smart 7kW Type 2 Untethered EV Charger": "Residential",
  "Myenergi Zappi Smart 7kW Type 2 Tethered EV Charger": "Residential",
  "Myenergi Zappi Glo 7kW Type 2 Tethered EV Charger": "Residential",
  "Ohme ePod EV Charger 7.4 KW Untethered EV Charger": "Residential",
  "Ohme Home Pro 7.4kW Type 2 Tethered EV Charger – 5m": "Residential",
  "Ohme Home Pro 7.4kW Type 2 Tethered EV Charger – 8m": "Residential",
  "Easee One 7.4 KW Smart EV Charger": "Residential",
  "Easee Charger Max Untethered EV Charger 7.4kW-22kW with Mid Meter": "Residential",
  "VCHRGD Seven Pro 7.4kW Type 2 EV Charger Tethered 7.5m": "Residential",
  "VCHRGD Seven Pro 7.4kW Type 2 Untethered EV Charger": "Residential",
  "SolaX Smart 7.2kW EV Charger G2 - Tethered": "Residential",
  "Zaptec Go 7.4kW Type 2 Rapid-Charge Smart EV Charger": "Residential",
  "Indra Smart Pro Indra GEN2 EV Charger Untethered White Edition": "Residential",
  "Indra Smart Pro 7.4KW EV Charger Tethered White Edition 6m": "Residential",
  "Indra Smart Pro GEN2 Type EV Charger Untethered – Black Edition": "Residential",
  "Indra Smart LUX EV Charger Gen2 Type 2 Tethered Black 6m": "Residential",
  "Sync Energy Untethered 7.4kW EV Charger Mode 3 Type 2 Wi-Fi/Ethernet IP6": "Residential",
  "Sync Energy EVWC2S7GG Smart EV Charger 7.4KW WiFi 4G": "Residential",
  "Sync Energy Tethered 7.4kW EV Charger Mode 3 Type 2 Wi-Fi/Ethernet IP6": "Residential",
  "Pod Point Solo 3S 7KW Untethered EV Charger": "Residential",
  "Pod Point Solo 3S 7KW Tethered EV Charger": "Residential",
  "Sevadis 7.4kW EV Charger, Type 2 Socket, 1 Outlet, Black, IP54, MaxiCharger Range": "Residential",
  "Sevadis 7.4kW EV Charger with 4G, Type 2 Socket, 1 Outlet, Black, IP54, MaxiCharger Range": "Residential",
  "vecGO 2.0 7.4kW EV Charger, Type 2, Single Phase, Tethered - VEC03-N": "Residential",
  "vecGO 2.0 7.4kW EV Charger, Type 1 & Type 2, Single Phase, Untethered - VEC01-N": "Residential",
  "Evec VecGO 7.4 kW Duo - Socketed With 5M Cable (Charge Two Cars Together)": "Residential",
  "FastAmps 7.4kW Alpha7 Gen4 Tethered EV Charger – Black": "Residential",
  "waEV-charge EV1i Smart Solar 7.4kW Charger Tethered 5m with WiFi / LAN": "Residential",
  "waEV-charge EV Smart 7.4kW Charger Untethered with WiFi": "Residential",
  "Tesla 7kW/22kW Type 2 Tethered Wall Connector EV Charger (Gen 3)": "Residential",

  "Easee Charge 22kW Commercial & Home EV Charger Type 2 Multiphase": "Commercial",
  "Myenergi Zappi EV Charger Smart 22kW Type 2 Tethered Multiphase": "Commercial",
  "Myenergi Zappi EV Charger Smart 22kW Type 2 Untethered Multiphase Black": "Commercial",
  "VCHRGD TwentyTwo Dual Socket 22kW EV Charger": "Commercial",
  "SolaX Smart Three Phase 22kW EV Charger G2 - Tethered": "Commercial",
  "Zaptec Go 2 7.4kW/22kW Smart EV Charger V2G-Ready": "Commercial",
  "Sevadis 22kW EV Charger with 4G, Type 2 Socket, 1 Outlet, Black, IP54, MaxiCharger Range": "Commercial",
  "Evec VecGO 22kW- Socketed EV Charger - Black": "Commercial",
  "EVEC 7.4kW Dual Socket Pedestal EV Charger, Type 1 & Type 2, Single Phase, Untethered - EDP01-N": "Commercial",
  "Evec VecSPRINT 22kW Dual Socketed Wall Charger – EDW02": "Commercial",
  "Evec VecSPRINT 7.4kW Dual Socketed Wall Charger EDW01": "Commercial",
  "Evec VecSPRINT 22kW Single Socketed Pedestal EV Charger": "Commercial",
  "EVEC 22kW Dual Socket Pedestal EV Charger, Type 1 & Type 2, Three Phase, Untethered - EDP02-N": "Commercial",

  "Zev Type 2 EV Charging Cables": "Accessory",
  "Wottz Untethered EV Charging Cable": "Accessory",
  "Wottz Compact Adaptor - Type 2 Vehicle": "Accessory",
  "Wottz Portable EV Granny Charger": "Accessory",
  "Tesla Matt:e Single Phase Monitoring and Protection Unit with built in RCBO": "Accessory",
};

// ─── Brand lookup (prefix match against the row name) ───────────────────────
const BRAND_PREFIXES: [string, string][] = [
  ["hypervolt", "Hypervolt"],
  ["myenergi", "Myenergi"],
  ["zappi", "Myenergi"],
  ["ohme", "Ohme"],
  ["easee", "Easee"],
  ["vchrgd", "VCHRGD"],
  ["solax", "SolaX"],
  ["zaptec", "Zaptec"],
  ["indra", "Indra"],
  ["sync energy", "Sync Energy"],
  ["pod point", "Pod Point"],
  ["sevadis", "Sevadis"],
  ["vecgo", "Evec"],
  ["vecsprint", "Evec"],
  ["evec", "Evec"],
  ["fastamps", "FastAmps"],
  ["waev-charge", "waEV-charge"],
  ["zev", "ZEV"],
  ["wottz", "Wottz"],
  ["tesla", "Tesla"],
];

function brandOf(name: string): string {
  const lower = name.toLowerCase();
  for (const [needle, brand] of BRAND_PREFIXES) {
    if (lower.includes(needle)) return brand;
  }
  return "Unknown";
}

// ─── Colour parsing ──────────────────────────────────────────────────────────
const COLOUR_WORDS = [
  "Space Grey",
  "Moonlight Cream",
  "Shadow Black",
  "Sage Green",
  "Deep Red",
  "Anthracite",
  "Black",
  "White",
  "Grey",
  "Green",
  "Red",
  "Blue",
];

function colourOf(name: string): string {
  for (const c of COLOUR_WORDS) {
    if (new RegExp(`\\b${c}\\b`, "i").test(name)) return c;
  }
  return "Black"; // reasonable default when no colour is stated
}

// Wottz cable SKUs encode colour in the SKU (…-BK-…, …-BU-…, …-YL-…) more
// reliably than the free-text name, which has a copy-paste error labelling
// the yellow variant "Black" too.
function wottzColourFromSku(sku: string): string | null {
  if (/-BK-/i.test(sku)) return "Black";
  if (/-BU-/i.test(sku)) return "Blue";
  if (/-YL-/i.test(sku)) return "Yellow";
  return null;
}

function lengthOf(name: string): string | null {
  const m = name.match(/(\d+(?:\.\d+)?)\s*m\b/i);
  return m ? `${m[1]}m` : null;
}

function connectionTypeOf(name: string): "Tethered" | "Untethered" {
  return /untethered/i.test(name) ? "Untethered" : "Tethered";
}

function powerOutputOf(name: string): string {
  const m = name.match(/(\d+(?:\.\d+)?)\s*[kK][wW]/);
  return m ? `${m[1]}kW` : "";
}

function phaseOf(name: string): "Single Phase" | "3 Phase" {
  return /3\s*phase|three\s*phase/i.test(name) ? "3 Phase" : "Single Phase";
}

// ─── Google Drive share link -> direct-viewable image URL ──────────────────
function driveImageUrl(shareUrl: string): string | null {
  const m = shareUrl.match(/\/file\/d\/([^/]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : null;
}

// ─── Write-up line classification (Description vs Product Features) ────────
// Standalone leftover section headers from the source document — not real
// content for either tab.
const HEADER_ARTIFACTS = new Set([
  "product detail",
  "product details",
  "specification",
  "specifications",
  "description",
  "features",
  "overview",
]);

// Long, sentence-like lines are marketing prose (Description tab); short
// callout/badge lines ("3 YEAR WARRANTY", "FREE DELIVERY") are Product
// Features instead.
function isDescriptionLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  return words.length > 7;
}

// ─── Slug generation ─────────────────────────────────────────────────────────
// Plain slug transform, no uniqueness — used for variantGroup, which must
// stay IDENTICAL across a family's colour/length siblings to group them.
// (Deduping this the way product ids are deduped would force siblings whose
// cleaned name happens to be identical — e.g. Hypervolt, whose write-up
// reference text is colour-specific — onto artificially different
// variantGroups, breaking the colour/length dropdowns entirely.)
function rawSlug(...parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const usedSlugs = new Set<string>();
function slugify(...parts: string[]): string {
  const base = rawSlug(...parts);
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n++}`;
  }
  usedSlugs.add(slug);
  return slug;
}

type Row = (string | number)[];

type BuiltProduct = {
  id: string;
  category: ProductCategory;
  name: string;
  brand: string;
  sku: string | null;
  colour: string;
  cardImage: string;
  gallery: string[];
  variantGroup: string;
  connectionType?: string;
  cableLength?: string;
  cableLengthOptions: string[];
  powerOutput?: string;
  style?: string;
  phase?: string;
  lengthOptions: string[];
  price: number | null;
  tagline: string | null;
  description: string[];
  features: string[];
  specs: { label: string; value: string }[];
  netRows: { name: string; sku: string; net: number }[];
};

async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const chargers = XLSX.utils.sheet_to_json(wb.Sheets["Chargers"], {
    header: 1,
    defval: "",
  }) as Row[];
  const writeups = XLSX.utils.sheet_to_json(wb.Sheets["Write-ups"], {
    header: 1,
    defval: "",
  }) as Row[];

  for (const r of chargers) {
    const fix = ROW_FIXES[String(r[COL.SKU] ?? "").trim()];
    if (!fix) continue;
    if (fix.name) r[COL.NAME] = fix.name;
    if (fix.writeup) r[COL.WRITEUP] = fix.writeup;
  }

  // Chargers row 16: SKU + Write-up both copy-pasted from row 15 above
  // (classic "copied the row above, forgot to update" error) — the real SKU
  // can't be fixed via ROW_FIXES since the wrong SKU (2H22TB) collides with
  // row 15's own, so this row is matched by its distinctive name instead.
  // Confirmed by the Untethered write-up's own body text, which references
  // "(2H22UB & 2H22UW)" directly.
  for (const r of chargers) {
    if (
      String(r[COL.NAME]).trim() ===
      "Myenergi Zappi EV Charger Smart 22kW Type 2 Untethered Multiphase -  Black"
    ) {
      r[COL.SKU] = "2H22UB";
      r[COL.WRITEUP] =
        "Myenergi Zappi EV Charger Smart 22kW Type 2 Untethered Multiphase Black";
    }
  }

  const dataRows = chargers
    .slice(1)
    .filter((r) => String(r[COL.NAME] ?? "").trim() !== "");

  const withWriteup = dataRows.filter(
    (r) => String(r[COL.WRITEUP] ?? "").trim() !== "",
  );

  // Group by write-up reference.
  const families = new Map<string, Row[]>();
  for (const r of withWriteup) {
    const key = String(r[COL.WRITEUP]).trim();
    if (EXCLUDED_FAMILIES.has(key)) continue;
    if (!families.has(key)) families.set(key, []);
    families.get(key)!.push(r);
  }

  // Write-up heading -> body paragraphs, matched by exact text against family keys.
  const familyKeys = new Set(families.keys());
  const headingIdx: { i: number; text: string }[] = [];
  writeups.forEach((r, i) => {
    const text = String(r[0] ?? "").trim();
    if (text && familyKeys.has(text)) headingIdx.push({ i, text });
  });
  // The write-up sheet turns out to have real structure, not just flowing
  // text: each block is [SKU/badge lines] [intro paragraphs] "Product Detail"
  // [bullet features] "Technical Specification" [label | value spec table,
  // using BOTH columns]. Parse around those section headers instead of
  // guessing from line length.
  const PRODUCT_DETAIL_HEADERS = new Set(["product detail", "product details"]);
  const SPEC_HEADERS = new Set(["technical specification", "specification", "specifications"]);

  function parseWriteupSections(key: string): {
    tagline: string | null;
    description: string[];
    features: string[];
    specs: { label: string; value: string }[];
  } {
    const idx = headingIdx.findIndex((h) => h.text === key);
    if (idx === -1) return { tagline: null, description: [], features: [], specs: [] };
    const start = headingIdx[idx].i + 1;
    const end = idx + 1 < headingIdx.length ? headingIdx[idx + 1].i : writeups.length;
    const rows = writeups.slice(start, end);

    let productDetailAt = -1;
    let specAt = -1;
    rows.forEach((r, i) => {
      const a = String(r[0] ?? "").trim().toLowerCase();
      if (productDetailAt === -1 && PRODUCT_DETAIL_HEADERS.has(a)) productDetailAt = i;
      if (specAt === -1 && SPEC_HEADERS.has(a)) specAt = i;
    });

    const preEnd = productDetailAt !== -1 ? productDetailAt : specAt !== -1 ? specAt : rows.length;
    const preLines = rows
      .slice(0, preEnd)
      .map((r) => String(r[0] ?? "").trim())
      .filter(Boolean)
      // SKU/price lines and stray section labels ("Features", "Description")
      // aren't real content for either tab.
      .filter((line) => !/^SKU:?\s*/i.test(line) && !/£\d/.test(line))
      .filter((line) => !HEADER_ARTIFACTS.has(line.toLowerCase()));

    const tagline = preLines[0] ?? null;
    const preRest = preLines.slice(1);
    // Among the intro block: long lines are real marketing prose, short ones
    // are badges ("3 YEAR WARRANTY", "FREE DELIVERY") — treat those as
    // features too, same as the structured "Product Detail" bullets below.
    const description = preRest.filter((line) => isDescriptionLine(line));
    const preFeatures = preRest.filter((line) => !isDescriptionLine(line));

    const detailFeatures =
      productDetailAt !== -1
        ? rows
            .slice(productDetailAt + 1, specAt !== -1 ? specAt : rows.length)
            .map((r) => String(r[0] ?? "").trim())
            .filter(Boolean)
        : [];

    const specs: { label: string; value: string }[] = [];
    if (specAt !== -1) {
      for (let i = specAt + 1; i < rows.length; i++) {
        const label = String(rows[i][0] ?? "").trim();
        const value = String(rows[i][1] ?? "").trim();
        if (!label || !value) continue;
        // The table's own header row ("Category" | "Specification").
        if (label.toLowerCase() === "category" && value.toLowerCase() === "specification") continue;
        specs.push({ label, value });
      }
    }

    return { tagline, description, features: [...preFeatures, ...detailFeatures], specs };
  }

  const STOPWORDS = new Set([
    "ev", "charger", "type", "2", "1", "the", "with", "for", "and", "&", "a",
  ]);
  function significantWords(s: string): Set<string> {
    return new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .split(" ")
        .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
    );
  }
  // Guards against the Zappi/Tesla-style corruption: a family whose most
  // descriptive row doesn't actually share real words with its own write-up
  // reference is almost certainly a copy-paste mismatch in the source data.
  function familyLooksConsistent(familyKey: string, rows: Row[]): boolean {
    const keyWords = significantWords(familyKey);
    return rows.some((r) => {
      const rowWords = significantWords(String(r[COL.NAME]));
      let overlap = 0;
      for (const w of rowWords) if (keyWords.has(w)) overlap++;
      return overlap >= 2;
    });
  }

  const built: BuiltProduct[] = [];
  const skippedAnomalies: string[] = [];

  for (const [familyKey, rows] of families) {
    const category = FAMILY_CATEGORY[familyKey];
    if (!category) {
      skippedAnomalies.push(`No category mapped for family: "${familyKey}" — skipped.`);
      continue;
    }
    if (!familyLooksConsistent(familyKey, rows)) {
      skippedAnomalies.push(
        `Family "${familyKey}" — no row name overlaps meaningfully with its own write-up reference (likely a source data mismatch, like the Zappi/Tesla ones) — skipped.`,
      );
      continue;
    }

    const isWottzCable = familyKey === "Wottz Untethered EV Charging Cable";
    const cleanFamilyKey = familyKey.replace(
      /\s*[-–]\s*(Black|White|Space Grey|Grey|Red|Green|Blue)\s*$/i,
      "",
    ).trim();
    const variantGroup = rawSlug(cleanFamilyKey);
    // A short row name like a bare "Grey" says nothing about connection type —
    // inherit the family's own type in that case rather than defaulting blind.
    const familyConn = connectionTypeOf(familyKey);
    // Same reasoning — a bare "Grey"/"Red" row has no kW figure in it at
    // all, but the rating is a family-wide constant, always present in the
    // write-up heading.
    const familyPower = powerOutputOf(familyKey);

    // Sub-group rows within the family by (colour, connectionType, length) —
    // these become separate Product rows. Length is a real priced variant
    // for some families (Hypervolt, Zev, Wottz — different net price per
    // length), not a cosmetic label, so it's part of the key just like
    // colour is — each length gets its own correctly-priced row instead of
    // every length folding into one row's `cableLengthOptions`/`lengthOptions`
    // with only the cheapest length's price surviving.
    const familyLengths = new Set(
      rows.map((r) => lengthOf(String(r[COL.NAME]))).filter(Boolean),
    );
    const familyHasMultipleLengths = familyLengths.size > 1;

    const subGroups = new Map<string, Row[]>();
    for (const r of rows) {
      const name = String(r[COL.NAME]);
      const sku = String(r[COL.SKU] ?? "");
      const colour = isWottzCable ? (wottzColourFromSku(sku) ?? colourOf(name)) : colourOf(name);
      const conn = significantWords(name).size >= 2 ? connectionTypeOf(name) : familyConn;
      const length = lengthOf(name) ?? "";
      const subKey = `${colour}::${conn}::${length}`;
      if (!subGroups.has(subKey)) subGroups.set(subKey, []);
      subGroups.get(subKey)!.push(r);
    }

    const {
      tagline,
      description,
      features: writeupFeatures,
      specs: writeupSpecs,
    } = parseWriteupSections(familyKey);
    const specValueFixes = SPEC_VALUE_FIXES[familyKey];
    if (specValueFixes) {
      for (const spec of writeupSpecs) {
        const fixed = specValueFixes[spec.label];
        if (fixed) spec.value = fixed;
      }
    }

    for (const [subKey, subRows] of subGroups) {
      const [colour, conn, subGroupLength] = subKey.split("::");

      // Two different "representative" rows for two different purposes:
      // the cheapest row gives the price (shorter cable = lower net price,
      // verified against the source data), but some sub-variant rows have
      // near-empty names (just "Grey"/"Red"/"Green" — the spreadsheet only
      // spells out the full name once per family) so naming/id/brand use
      // whichever row has the most descriptive (longest) name instead.
      const priceRow = [...subRows].sort(
        (a, b) => Number(a[COL.NET_PRICE] || 0) - Number(b[COL.NET_PRICE] || 0),
      )[0];
      const nameRow = [...subRows].sort(
        (a, b) => String(b[COL.NAME]).length - String(a[COL.NAME]).length,
      )[0];
      const descriptiveName = String(nameRow[COL.NAME]).trim();

      // Tied to the priced variant row, not whichever row had the most
      // descriptive name — same reasoning as price itself.
      const sku = String(priceRow[COL.SKU] ?? "").trim() || null;

      // "Net Price" (the column right after Mark up) is the true pricing
      // basis — confirmed empty as typed data in the source sheet, so it's
      // computed here exactly as its position/name implies: Net price +
      // Mark up (a flat £ add-on that varies per row, not a percentage).
      const netPrice =
        Number(priceRow[COL.NET_PRICE] || 0) + Number(priceRow[COL.MARKUP] || 0);
      // Round to the nearest penny (2dp) — a real price, not the nearest
      // whole pound. The ×1.2 VAT multiply can produce a third decimal
      // digit (e.g. 393.31 × 1.2 = 471.972), which isn't a real amount of
      // money, so this still rounds — just to the finest unit that exists.
      const price = netPrice > 0 ? Math.round(netPrice * 1.2 * 100) / 100 : null;

      const photos: string[] = [];
      for (let c = COL.PHOTO_START; c <= COL.PHOTO_END; c++) {
        const v = String(nameRow[c] ?? "").trim();
        if (v) {
          const url = driveImageUrl(v);
          if (url) photos.push(url);
        }
      }

      const lengths = Array.from(
        new Set(subRows.map((r) => lengthOf(String(r[COL.NAME]))).filter(Boolean)),
      ) as string[];

      // Prefer the family's own name (it's the write-up's own title, always a
      // real product name) — a per-row name is only trusted when it actually
      // carries real content (2+ significant words), since some sub-variant
      // rows are just a bare colour word ("Grey") with nothing else useful.
      // Either way, the connection type is corrected to match this specific
      // sub-variant — the family key alone can't distinguish tethered from
      // untethered when both share one write-up (e.g. FastAmps).
      const rowNameIsReal = significantWords(descriptiveName).size >= 2;
      const rawBase = rowNameIsReal ? descriptiveName : cleanFamilyKey;
      // Only strip a trailing length when the FAMILY spans several lengths
      // (across all its sub-groups) — if there's just one length overall,
      // it's part of what distinguishes this family from a sibling (e.g.
      // Ohme Home Pro 5m vs 8m are two separate write-ups, not variants of
      // each other). Now that length is part of the sub-group key, always
      // normalize (strip) whatever length text happened to survive in this
      // row's own name for a multi-length family, then re-append this
      // sub-group's own definitive length explicitly below — don't rely on
      // incidental text already being correct/present (a terse per-row name
      // like "7.5m - Black" can fail the rowNameIsReal check above and fall
      // back to cleanFamilyKey, silently losing that row's own length).
      // Strip any colour word wherever it appears (not just trailing) — a few
      // rows keep a stale colour in the middle of the text (e.g. a Wottz
      // "Yellow" cable whose row name still literally says "Black").
      let nameWithoutColourOrLength = rawBase
        .replace(
          /\b(Black|White|Space Grey|Moonlight Cream|Shadow Black|Sage Green|Deep Red|Anthracite|Grey|Red|Green|Blue)\b/gi,
          "",
        )
        .replace(/\s{2,}/g, " ")
        .replace(/\s*[-–]\s*$/, "")
        .trim();
      if (familyHasMultipleLengths) {
        // Strip length wherever it appears (not just trailing) — some rows
        // state it mid-string (e.g. "Wottz Portable EV Granny Charger 2m -
        // Vehicle Socket Type 2 (UK10A Max)"), same reasoning as colour above.
        nameWithoutColourOrLength = nameWithoutColourOrLength
          .replace(/\s*[-–]?\s*\d+(?:\.\d+)?\s*m\b/gi, "")
          .replace(/\s{2,}/g, " ")
          .replace(/\s*[-–]\s*$/, "")
          .trim();
      }
      const baseForName =
        category === "Accessory"
          ? nameWithoutColourOrLength
          : /tethered/i.test(nameWithoutColourOrLength)
            ? nameWithoutColourOrLength.replace(/untethered|tethered/i, conn)
            : `${nameWithoutColourOrLength} ${conn}`;
      // Re-append this sub-group's own length (the one used to build subKey,
      // not whatever text may or may not have survived above) so multi-length
      // siblings get distinct, meaningful names/slugs — e.g. "... 5m",
      // "... 7.5m", "... 10m" — instead of colliding on one name.
      const baseForNameWithLength =
        familyHasMultipleLengths && subGroupLength
          ? `${baseForName} ${subGroupLength}`
          : baseForName;
      const name = new RegExp(`\\b${colour}\\b\\s*$`, "i").test(baseForNameWithLength)
        ? baseForNameWithLength
        : `${baseForNameWithLength} - ${colour}`;

      const id = slugify(baseForNameWithLength, colour);

      const netRows = subRows.map((r) => ({
        name: String(r[COL.NAME]),
        sku: String(r[COL.SKU] ?? ""),
        net: Number(r[COL.NET_PRICE] || 0),
      }));

      // Specification tab: prefer the write-up's own "Technical Specification"
      // table (real label/value pairs — dimensions, IP rating, protocols,
      // etc.) when the source has one; fall back to fields already parsed
      // precisely during import for the products that don't.
      // Brand from `rawBase`, not the raw `descriptiveName` — same fallback
      // as the name-building above: some sub-variant rows are just a bare
      // colour word ("Grey") with no brand text at all, so detecting brand
      // off the row's own name directly (rather than the family key it
      // falls back to) was silently producing "Unknown" for those variants
      // even though sibling variants of the same product were branded fine.
      const brand = brandOf(rawBase);
      const fallbackSpecs: { label: string; value: string }[] = [
        { label: "Brand", value: brand },
        { label: "Colour", value: colour },
      ];
      const features = writeupFeatures;

      if (category === "Accessory") {
        const style = "Straight";
        const phase = phaseOf(descriptiveName);
        fallbackSpecs.push({ label: "Style", value: style }, { label: "Phase", value: phase });
        if (lengths.length) fallbackSpecs.push({ label: "Length options", value: lengths.join(", ") });
        const specs = writeupSpecs.length > 0 ? writeupSpecs : fallbackSpecs;

        built.push({
          id,
          category,
          name,
          brand,
          sku,
          colour,
          cardImage: photos[0] ?? "",
          gallery: photos,
          variantGroup,
          style,
          phase,
          lengthOptions: lengths,
          cableLengthOptions: [],
          price,
          tagline,
          description,
          features,
          specs,
          netRows,
        });
      } else {
        // Last resort: some write-ups (Indra) never state the kW rating in
        // either the row name or the family key, only inside the parsed
        // "Charging Power" spec row itself (e.g. "Max output 7.4kW...").
        const chargingPowerSpec =
          writeupSpecs.find((s) => /charging power/i.test(s.label))?.value ?? "";
        const powerOutput =
          powerOutputOf(descriptiveName) ||
          familyPower ||
          powerOutputOf(chargingPowerSpec);
        fallbackSpecs.push({ label: "Connection type", value: conn });
        if (powerOutput) fallbackSpecs.push({ label: "Power output", value: powerOutput });
        if (lengths.length) fallbackSpecs.push({ label: "Cable length", value: lengths.join(", ") });
        const specs = writeupSpecs.length > 0 ? writeupSpecs : fallbackSpecs;

        built.push({
          id,
          category,
          name,
          brand,
          sku,
          colour,
          cardImage: photos[0] ?? "",
          gallery: photos,
          variantGroup,
          connectionType: conn,
          cableLength: lengths[0] ?? undefined,
          cableLengthOptions: lengths,
          powerOutput,
          lengthOptions: [],
          price,
          tagline,
          description,
          features,
          specs,
          netRows,
        });
      }
    }
  }

  // Overlay hand-supplied content for products whose write-up has no
  // matching heading anywhere in the sheet (see CONTENT_FIXES above).
  for (const p of built) {
    const fix = p.sku ? CONTENT_FIXES[p.sku.trim()] : undefined;
    if (fix) {
      p.description = fix.description;
      p.features = fix.features;
      p.specs = fix.specs;
    }
  }

  // ─── Report ────────────────────────────────────────────────────────────
  console.log(`Families available: ${families.size} (excluded: ${EXCLUDED_FAMILIES.size})`);
  console.log(`Products built: ${built.length}`);
  const byCategory = built.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log("By category:", byCategory);
  if (skippedAnomalies.length) {
    console.log("\nSkipped (no category mapping):");
    skippedAnomalies.forEach((s) => console.log(" -", s));
  }

  console.log("\n=== Full product list ===");
  for (const p of built) {
    console.log(
      `[${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  colour=${p.colour}  images=${p.gallery.length}  options=${(p.cableLengthOptions.length || p.lengthOptions.length)}  desc=${p.description.length}  features=${p.features.length}  specs=${p.specs.length}`,
    );
  }

  const missingImage = built.filter((p) => !p.cardImage);
  const missingPrice = built.filter((p) => p.price == null);
  if (missingImage.length) {
    console.log(`\n⚠ ${missingImage.length} product(s) with no image:`, missingImage.map((p) => p.id));
  }
  if (missingPrice.length) {
    console.log(`\n⚠ ${missingPrice.length} product(s) with no price:`, missingPrice.map((p) => p.id));
  }

  if (BACKFILL) {
    console.log(`\nBackfilling sku + price + powerOutput + spec on ${built.length} existing product(s) (non-destructive)...`);
    const results = await Promise.all(
      built.map((p) =>
        prisma.product
          .update({
            where: { id: p.id },
            data: {
              sku: p.sku,
              price: p.price,
              powerOutput: p.powerOutput || null,
              spec: p.powerOutput
                ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim()
                : null,
            },
          })
          .then(() => ({ id: p.id, ok: true as const }))
          .catch(() => ({ id: p.id, ok: false as const })),
      ),
    );
    const updated = results.filter((r) => r.ok);
    const missing = results.filter((r) => !r.ok);
    console.log(`Updated sku + price + powerOutput + spec on ${updated.length} product(s).`);
    if (missing.length) {
      console.log(
        `⚠ ${missing.length} id(s) from this run had no matching existing product (skipped):`,
        missing.map((r) => r.id),
      );
    }
    console.log("Done.");
    return;
  }

  if (ADD_TESLA) {
    const teslaProducts = built.filter((p) => p.brand === "Tesla");
    console.log(`\nFound ${teslaProducts.length} Tesla product(s) to add:`);
    for (const p of teslaProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      console.log(
        `  [${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  warranty=${warranty ?? "—"}`,
      );
    }

    if (!COMMIT) {
      console.log("\nDry run only — no database changes made. Re-run with --add-tesla --commit to apply.");
      return;
    }

    const { _max } = await prisma.product.aggregate({ _max: { sortOrder: true } });
    let nextSortOrder = (_max.sortOrder ?? 0) + 1;

    for (const p of teslaProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      await prisma.product.create({
        data: {
          id: p.id,
          category: p.category,
          name: p.name,
          brand: p.brand,
          sku: p.sku,
          colour: p.colour,
          cardImage: p.cardImage || "https://placehold.co/600x600?text=Photo+coming+soon",
          gallery: p.gallery,
          tags: [],
          variantGroup: p.variantGroup,
          active: true,
          featured: false,
          sortOrder: nextSortOrder++,
          spec: p.powerOutput ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim() : null,
          connectionType: p.connectionType ?? null,
          cableLength: p.cableLength ?? null,
          cableLengthOptions: p.cableLengthOptions,
          powerOutput: p.powerOutput || null,
          price: p.price,
          installFee: p.category === "Residential" ? 540 : null,
          style: p.style ?? null,
          phase: p.phase ?? null,
          lengthOptions: p.lengthOptions,
          tagline: p.tagline,
          description: p.description,
          features: p.features,
          specs: p.specs,
          warranty,
        },
      });
      console.log(`Created ${p.id}.`);
    }

    console.log(`\nDone. Created ${teslaProducts.length} product(s).`);
    return;
  }

  if (ADD_MYENERGI_22KW) {
    const myenergiProducts = built.filter((p) => p.sku?.startsWith("2H22"));
    console.log(`\nFound ${myenergiProducts.length} Myenergi Zappi 22kW product(s) to add:`);
    for (const p of myenergiProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      console.log(
        `  [${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  warranty=${warranty ?? "—"}`,
      );
    }

    if (!COMMIT) {
      console.log("\nDry run only — no database changes made. Re-run with --add-myenergi-22kw --commit to apply.");
      return;
    }

    const { _max } = await prisma.product.aggregate({ _max: { sortOrder: true } });
    let nextSortOrder = (_max.sortOrder ?? 0) + 1;

    for (const p of myenergiProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      await prisma.product.create({
        data: {
          id: p.id,
          category: p.category,
          name: p.name,
          brand: p.brand,
          sku: p.sku,
          colour: p.colour,
          cardImage: p.cardImage || "https://placehold.co/600x600?text=Photo+coming+soon",
          gallery: p.gallery,
          tags: [],
          variantGroup: p.variantGroup,
          active: true,
          featured: false,
          sortOrder: nextSortOrder++,
          spec: p.powerOutput ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim() : null,
          connectionType: p.connectionType ?? null,
          cableLength: p.cableLength ?? null,
          cableLengthOptions: p.cableLengthOptions,
          powerOutput: p.powerOutput || null,
          price: p.price,
          installFee: p.category === "Residential" ? 540 : null,
          style: p.style ?? null,
          phase: p.phase ?? null,
          lengthOptions: p.lengthOptions,
          tagline: p.tagline,
          description: p.description,
          features: p.features,
          specs: p.specs,
          warranty,
        },
      });
      console.log(`Created ${p.id}.`);
    }

    console.log(`\nDone. Created ${myenergiProducts.length} product(s).`);
    return;
  }

  if (ADD_WAEV_WIFI) {
    const waevProducts = built.filter((p) => p.sku?.trim() === "WAEVEV17WIFI");
    console.log(`\nFound ${waevProducts.length} waEV EV1S product(s) to add:`);
    for (const p of waevProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      console.log(
        `  [${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  warranty=${warranty ?? "—"}`,
      );
    }

    if (!COMMIT) {
      console.log("\nDry run only — no database changes made. Re-run with --add-waev-wifi --commit to apply.");
      return;
    }

    const { _max } = await prisma.product.aggregate({ _max: { sortOrder: true } });
    let nextSortOrder = (_max.sortOrder ?? 0) + 1;

    for (const p of waevProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      await prisma.product.create({
        data: {
          id: p.id,
          category: p.category,
          name: p.name,
          brand: p.brand,
          sku: p.sku,
          colour: p.colour,
          cardImage: p.cardImage || "https://placehold.co/600x600?text=Photo+coming+soon",
          gallery: p.gallery,
          tags: [],
          variantGroup: p.variantGroup,
          active: true,
          featured: false,
          sortOrder: nextSortOrder++,
          spec: p.powerOutput ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim() : null,
          connectionType: p.connectionType ?? null,
          cableLength: p.cableLength ?? null,
          cableLengthOptions: p.cableLengthOptions,
          powerOutput: p.powerOutput || null,
          price: p.price,
          installFee: p.category === "Residential" ? 540 : null,
          style: p.style ?? null,
          phase: p.phase ?? null,
          lengthOptions: p.lengthOptions,
          tagline: p.tagline,
          description: p.description,
          features: p.features,
          specs: p.specs,
          warranty,
        },
      });
      console.log(`Created ${p.id}.`);
    }

    console.log(`\nDone. Created ${waevProducts.length} product(s).`);
    return;
  }

  if (ADD_EASEE) {
    const easeeProducts = built.filter(
      (p) => p.sku?.trim() === "10243" || p.sku?.trim() === "10233",
    );
    console.log(`\nFound ${easeeProducts.length} Easee product(s) to add:`);
    for (const p of easeeProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      console.log(
        `  [${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  warranty=${warranty ?? "—"}`,
      );
    }

    if (!COMMIT) {
      console.log("\nDry run only — no database changes made. Re-run with --add-easee --commit to apply.");
      return;
    }

    const { _max } = await prisma.product.aggregate({ _max: { sortOrder: true } });
    let nextSortOrder = (_max.sortOrder ?? 0) + 1;

    for (const p of easeeProducts) {
      const warranty = p.specs.find((s) => s.label === "Warranty")?.value ?? null;
      await prisma.product.create({
        data: {
          id: p.id,
          category: p.category,
          name: p.name,
          brand: p.brand,
          sku: p.sku,
          colour: p.colour,
          cardImage: p.cardImage || "https://placehold.co/600x600?text=Photo+coming+soon",
          gallery: p.gallery,
          tags: [],
          variantGroup: p.variantGroup,
          active: true,
          featured: false,
          sortOrder: nextSortOrder++,
          spec: p.powerOutput ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim() : null,
          connectionType: p.connectionType ?? null,
          cableLength: p.cableLength ?? null,
          cableLengthOptions: p.cableLengthOptions,
          powerOutput: p.powerOutput || null,
          price: p.price,
          installFee: p.category === "Residential" ? 540 : null,
          style: p.style ?? null,
          phase: p.phase ?? null,
          lengthOptions: p.lengthOptions,
          tagline: p.tagline,
          description: p.description,
          features: p.features,
          specs: p.specs,
          warranty,
        },
      });
      console.log(`Created ${p.id}.`);
    }

    console.log(`\nDone. Created ${easeeProducts.length} product(s).`);
    return;
  }

  if (!COMMIT) {
    console.log("\nDry run only — no database changes made. Re-run with --commit to apply.");
    return;
  }

  console.log("\nCommitting: deleting old placeholder products, inserting new catalogue...");
  // Array-form transaction (one batched round trip) instead of an interactive
  // callback with 59 sequential awaited creates — the latter held the
  // connection open long enough to blow Prisma's transaction timeout.
  const [deleted, inserted] = await prisma.$transaction([
    prisma.product.deleteMany({}),
    prisma.product.createMany({
      data: built.map((p, i) => ({
        id: p.id,
        category: p.category,
        name: p.name,
        brand: p.brand,
        sku: p.sku,
        colour: p.colour,
        cardImage: p.cardImage || "https://placehold.co/600x600?text=Photo+coming+soon",
        gallery: p.gallery,
        tags: [],
        variantGroup: p.variantGroup,
        active: true,
        featured: false,
        sortOrder: i,
        spec: p.powerOutput ? `${p.powerOutput} · ${p.connectionType ?? ""}`.trim() : null,
        connectionType: p.connectionType ?? null,
        cableLength: p.cableLength ?? null,
        cableLengthOptions: p.cableLengthOptions,
        powerOutput: p.powerOutput || null,
        price: p.price,
        style: p.style ?? null,
        phase: p.phase ?? null,
        lengthOptions: p.lengthOptions,
        tagline: p.tagline,
        description: p.description,
        features: p.features,
        specs: p.specs,
        warranty: null,
      })),
    }),
  ], { timeout: 30000 });
  console.log(`Deleted ${deleted.count} old products. Inserted ${inserted.count} new products.`);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
