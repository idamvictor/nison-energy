/**
 * One-off migration: replace the placeholder catalog (prisma/seed-products.ts,
 * 23 rows) with real data from the "Ocunio Energy - Master Product Catalogue"
 * spreadsheet. See the approved plan for the full rationale (pricing formula,
 * category classification, exclusions).
 *
 *   npx tsx scripts/import-catalogue.ts            # dry run — prints only
 *   npx tsx scripts/import-catalogue.ts --commit    # deletes old + inserts new
 */
import "dotenv/config";
import XLSX from "xlsx";

import { prisma } from "../src/lib/db";
import type { ProductCategory } from "../src/generated/prisma/client";

const XLSX_PATH =
  "C:/Users/User/Downloads/Ocunio Energy - Master Product Catalogue_1.xlsx";

const COMMIT = process.argv.includes("--commit");

// ─── Column indices (Chargers sheet) ────────────────────────────────────────
const COL = {
  NAME: 0,
  SKU: 1,
  NET_PRICE: 3,
  WRITEUP: 16,
  PHOTO_START: 17,
  PHOTO_END: 28,
};

// ─── Families to exclude — corrupted source data, not guessed at ───────────
const EXCLUDED_FAMILIES = new Set([
  "Myenergi Zappi EV Charger Smart 22kW Type 2 Tethered Multiphase",
  "Myenergi Zappi EV Charger Smart 22kW Type 2 Untethered Multiphase Black",
  "Tesla 7kW/22kW Type 2 Tethered Wall Connector EV Charger (Gen 3)",
  // These two families' write-up references got cross-assigned in the source
  // (family A's only row is literally named after family B's own write-up
  // title, and vice versa) — same class of copy-paste error as the two
  // above, just with generic enough wording ("Charge"/"Charger"/"22kW") that
  // the automatic word-overlap check below doesn't catch it. Confirmed by
  // hand against the raw sheet data.
  "Easee Charge 22kW Commercial & Home EV Charger Type 2 Multiphase",
  "Easee Charger Max Untethered EV Charger 7.4kW-22kW with Mid Meter",
]);

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

  "Easee Charge 22kW Commercial & Home EV Charger Type 2 Multiphase": "Commercial",
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

// ─── Slug generation ─────────────────────────────────────────────────────────
const usedSlugs = new Set<string>();
function slugify(...parts: string[]): string {
  const base = parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
  function writeupBody(key: string): string[] {
    const idx = headingIdx.findIndex((h) => h.text === key);
    if (idx === -1) return [];
    const start = headingIdx[idx].i + 1;
    const end = idx + 1 < headingIdx.length ? headingIdx[idx + 1].i : start + 12;
    return writeups
      .slice(start, end)
      .map((r) => String(r[0] ?? "").trim())
      .filter(Boolean)
      // Metadata lines (SKU refs, price notes) sit right under the heading in
      // most blocks — real marketing copy, not a tagline/description line.
      .filter((line) => !/^SKU:?\s*/i.test(line) && !/£\d/.test(line));
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
    const variantGroup = slugify(cleanFamilyKey);
    // A short row name like a bare "Grey" says nothing about connection type —
    // inherit the family's own type in that case rather than defaulting blind.
    const familyConn = connectionTypeOf(familyKey);

    // Sub-group rows within the family by (colour, connectionType) — these
    // become separate Product rows; length differences fold into options.
    const subGroups = new Map<string, Row[]>();
    for (const r of rows) {
      const name = String(r[COL.NAME]);
      const sku = String(r[COL.SKU] ?? "");
      const colour = isWottzCable ? (wottzColourFromSku(sku) ?? colourOf(name)) : colourOf(name);
      const conn = significantWords(name).size >= 2 ? connectionTypeOf(name) : familyConn;
      const subKey = `${colour}::${conn}`;
      if (!subGroups.has(subKey)) subGroups.set(subKey, []);
      subGroups.get(subKey)!.push(r);
    }

    const body = writeupBody(familyKey);
    const tagline = body[0] ?? null;
    const description = body.slice(1);

    for (const [subKey, subRows] of subGroups) {
      const [colour, conn] = subKey.split("::");

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

      const netPrice = Number(priceRow[COL.NET_PRICE] || 0);
      const price = netPrice > 0 ? Math.round(netPrice * 1.2) : null;

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
      // Only strip a trailing length when several lengths are being collapsed
      // into this one product's options — if there's just one, it's part of
      // what distinguishes this family from a sibling (e.g. Ohme Home Pro 5m
      // vs 8m are two separate write-ups, not variants of each other).
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
      if (lengths.length > 1) {
        nameWithoutColourOrLength = nameWithoutColourOrLength
          .replace(/\s*[-–]?\s*\d+(?:\.\d+)?\s*m\b\s*$/i, "")
          .trim();
      }
      const baseForName =
        category === "Accessory"
          ? nameWithoutColourOrLength
          : /tethered/i.test(nameWithoutColourOrLength)
            ? nameWithoutColourOrLength.replace(/untethered|tethered/i, conn)
            : `${nameWithoutColourOrLength} ${conn}`;
      const name = new RegExp(`\\b${colour}\\b\\s*$`, "i").test(baseForName)
        ? baseForName
        : `${baseForName} - ${colour}`;

      const id = slugify(baseForName, colour);

      const netRows = subRows.map((r) => ({
        name: String(r[COL.NAME]),
        sku: String(r[COL.SKU] ?? ""),
        net: Number(r[COL.NET_PRICE] || 0),
      }));

      if (category === "Accessory") {
        built.push({
          id,
          category,
          name,
          brand: brandOf(descriptiveName),
          colour,
          cardImage: photos[0] ?? "",
          gallery: photos,
          variantGroup,
          style: "Straight",
          phase: phaseOf(descriptiveName),
          lengthOptions: lengths,
          cableLengthOptions: [],
          price,
          tagline,
          description,
          netRows,
        });
      } else {
        built.push({
          id,
          category,
          name,
          brand: brandOf(descriptiveName),
          colour,
          cardImage: photos[0] ?? "",
          gallery: photos,
          variantGroup,
          connectionType: conn,
          cableLength: lengths[0] ?? undefined,
          cableLengthOptions: lengths,
          powerOutput: powerOutputOf(descriptiveName),
          lengthOptions: [],
          price,
          tagline,
          description,
          netRows,
        });
      }
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
      `[${p.category}] ${p.id}  "${p.name}"  £${p.price ?? "—"}  colour=${p.colour}  images=${p.gallery.length}  options=${(p.cableLengthOptions.length || p.lengthOptions.length)}  desc-paragraphs=${p.description.length}`,
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
        features: [],
        specs: p.powerOutput ? [{ label: "Power output", value: p.powerOutput }] : [],
        warranty: null,
      })),
    }),
  ]);
  console.log(`Deleted ${deleted.count} old products. Inserted ${inserted.count} new products.`);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
