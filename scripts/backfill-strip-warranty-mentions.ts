/**
 * One-off backfill: the "Warranty: X years" figure is already shown as its
 * own badge up top (purchase panel), so remove warranty mentions from the
 * Description tab's paragraphs and bullet list instead of showing it twice.
 *
 * Features: each entry is a single, atomic bullet — any line mentioning
 * warranty is entirely about warranty, so it's dropped outright.
 *
 * Description: paragraphs are full prose. Whole SENTENCES that mention
 * warranty are dropped (sentence-level, not clause-level — an earlier
 * attempt at trimming just the trailing warranty clause out of a compound
 * sentence proved unreliable across the wide variety of real phrasing here,
 * sometimes cutting at the wrong comma and losing unrelated content, e.g. a
 * "free shipping" mention that happened to share a sentence with the
 * warranty clause). Sentence-level removal is always grammatically safe —
 * it only ever drops complete sentences, never a fragment — at the cost of
 * occasionally also losing other content that happened to be bundled into
 * the same sentence as the warranty mention. A paragraph that becomes empty
 * is dropped entirely.
 *
 *   npx tsx scripts/backfill-strip-warranty-mentions.ts            # dry run
 *   npx tsx scripts/backfill-strip-warranty-mentions.ts --commit    # writes
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

// One paragraph (waEV-charge EV1i) bundles a real certification/compliance
// clause into the same sentence as the warranty mention — the generic
// sentence-level stripping below would drop the certification info too, so
// it's hand-corrected here instead of relying on the generic pass.
const PARAGRAPH_FIXES: Record<string, string> = {
  "Meeting rigorous quality and safety standards, the charger is TUV CE and UKCA certified, fully OZEV approved under both the EVHS and WCS schemes for grant eligibility, and backed by a comprehensive manufacturer's warranty for long-term peace of mind.":
    "Meeting rigorous quality and safety standards, the charger is TUV CE and UKCA certified, fully OZEV approved under both the EVHS and WCS schemes for grant eligibility.",
  "Personalise your lead with a choice of high-visibility or sleek colours to match your style or increase trip safety in dark or communal parking areas. Built using flexible, weather-resistant materials for effortless coiling in all seasons, every bespoke cable includes a comprehensive 2-year manufacturer’s warranty and fast, complimentary shipping straight to your door for total convenience and peace of mind.":
    "Personalise your lead with a choice of high-visibility or sleek colours to match your style or increase trip safety in dark or communal parking areas. Built using flexible, weather-resistant materials for effortless coiling in all seasons, with fast, complimentary shipping straight to your door for total convenience and peace of mind.",
  "Built for maximum reliability and ease of installation, the Hypervolt features seamless connectivity through built-in Wi-Fi or Ethernet, alongside automatic over-the-air firmware updates to keep your charger up to date. Its advanced internal PEN protection eliminates the need for an earth rod during installation, saving both time and money. Additionally, automatic load management continuously monitors household power consumption to prevent electrical overloads, and the charger comes backed by a comprehensive 3-year warranty for complete peace of mind.":
    "Built for maximum reliability and ease of installation, the Hypervolt features seamless connectivity through built-in Wi-Fi or Ethernet, alongside automatic over-the-air firmware updates to keep your charger up to date. Its advanced internal PEN protection eliminates the need for an earth rod during installation, saving both time and money. Additionally, automatic load management continuously monitors household power consumption to prevent electrical overloads.",
  "Discover the Zaptec Go 7.4kW Smart EV Charger. Ultra-compact wallbox featuring universal Type 2 compatibility, 4G/Wi-Fi, RFID access, interchangeable fascias, and a 5-year warranty.":
    "Discover the Zaptec Go 7.4kW Smart EV Charger. Ultra-compact wallbox featuring universal Type 2 compatibility, 4G/Wi-Fi, RFID access, and interchangeable fascias.",
  "Engineered with electrical safety and durability at the forefront, the charger incorporates built-in PME fault detection and PEN protection, completely eliminating the need for separate, expensive earth rods during installation. Electrical protection is comprehensive, featuring 30mA AC and 6mA DC ground fault detection, overcurrent, overvoltage, undervoltage, and integrated surge safeguards. Built with an IP54-rated, IK10 impact-resistant casing in a stylish Black & Grey finish, the unit operates reliably between -30°C and +50°C, staying continuously connected via onboard 4G and Wi-Fi backed by a standard 3-year warranty.":
    "Engineered with electrical safety and durability at the forefront, the charger incorporates built-in PME fault detection and PEN protection, completely eliminating the need for separate, expensive earth rods during installation. Electrical protection is comprehensive, featuring 30mA AC and 6mA DC ground fault detection, overcurrent, overvoltage, undervoltage, and integrated surge safeguards. Built with an IP54-rated, IK10 impact-resistant casing in a stylish Black & Grey finish, the unit operates reliably between -30°C and +50°C, staying continuously connected via onboard 4G and Wi-Fi.",
  "Safety, durability, and rapid installation are built directly into the charger's design, featuring integrated PME fault detection and PEN protection that completely eliminate the need for costly earth rods. Comprehensive electrical safeguards include 30mA AC and 6mA DC ground fault detection, overcurrent, overvoltage, undervoltage, integrated surge protection, and active anti-tamper alerts. Housed in a durable black IP54-rated and IK10 impact-resistant casing operating reliably from -30°C to +50°C, the unit includes static and dynamic load balancing, SmartDock rapid-installation technology, OCPP 1.6J/2.0.1 compliance, and full OZEV grant approval, backed by a standard 3-year warranty.":
    "Safety, durability, and rapid installation are built directly into the charger's design, featuring integrated PME fault detection and PEN protection that completely eliminate the need for costly earth rods. Comprehensive electrical safeguards include 30mA AC and 6mA DC ground fault detection, overcurrent, overvoltage, undervoltage, integrated surge protection, and active anti-tamper alerts. Housed in a durable black IP54-rated and IK10 impact-resistant casing operating reliably from -30°C to +50°C, the unit includes static and dynamic load balancing, SmartDock rapid-installation technology, OCPP 1.6J/2.0.1 compliance, and full OZEV grant approval.",
  "Built to the highest reliability and electrical safety standards, the charger features built-in PME fault detection and PEN protection, eliminating the requirement and expense of installing separate earth rods. Comprehensive safety mechanisms include 30mA AC and 6mA DC ground fault detection alongside protection against overcurrent, overvoltage, undervoltage, and power surges. Housed in a robust IP54-rated, IK10 impact-resistant black and grey enclosure, it operates reliably in extreme temperatures from -30°C to +50°C, while integrated 4G, Wi-Fi, and Ethernet connectivity keep the unit continuously online for remote phase balancing, updates, and maintenance backed by a standard 3-year warranty.":
    "Built to the highest reliability and electrical safety standards, the charger features built-in PME fault detection and PEN protection, eliminating the requirement and expense of installing separate earth rods. Comprehensive safety mechanisms include 30mA AC and 6mA DC ground fault detection alongside protection against overcurrent, overvoltage, undervoltage, and power surges. Housed in a robust IP54-rated, IK10 impact-resistant black and grey enclosure, it operates reliably in extreme temperatures from -30°C to +50°C, while integrated 4G, Wi-Fi, and Ethernet connectivity keep the unit continuously online for remote phase balancing, updates, and maintenance.",
  "Built with high-impact, UV-resistant ABS and silver-plated copper contacts, the adaptor provides maximum conductivity and minimal heat buildup. Its rugged IP54-rated casing ensures dependable outdoor performance in wet and dusty conditions, while automatic connector locking keeps charging safe and secure. CE and UKCA certified and backed by a 2-year warranty, it is the essential pocket-sized solution for versatile, worry-free AC charging.":
    "Built with high-impact, UV-resistant ABS and silver-plated copper contacts, the adaptor provides maximum conductivity and minimal heat buildup. Its rugged IP54-rated casing ensures dependable outdoor performance in wet and dusty conditions, while automatic connector locking keeps charging safe and secure. CE and UKCA certified, it is the essential pocket-sized solution for versatile, worry-free AC charging.",
};

function stripWarrantyFromParagraph(paragraph: string): string | null {
  if (PARAGRAPH_FIXES[paragraph]) return PARAGRAPH_FIXES[paragraph];
  if (!/warrant/i.test(paragraph)) return paragraph;

  const sentences = paragraph.match(/[^.!?]+[.!?]*(?=\s+|$)/g) ?? [paragraph];
  const kept = sentences.map((s) => s.trim()).filter((s) => s && !/warrant/i.test(s));

  if (kept.length === 0) return null;
  return kept.join(" ");
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, features: true, description: true },
  });

  const updates: { id: string; features: string[]; description: string[] }[] = [];

  for (const p of products) {
    const newFeatures = p.features.filter((f) => !/warrant/i.test(f));
    const perParagraph = p.description.map((d) => ({
      before: d,
      after: stripWarrantyFromParagraph(d),
    }));
    const newDescription = perParagraph
      .map((x) => x.after)
      .filter((d): d is string => d !== null);

    const featuresChanged = newFeatures.length !== p.features.length;
    const descriptionChanged = perParagraph.some((x) => x.after !== x.before);

    if (featuresChanged || descriptionChanged) {
      updates.push({ id: p.id, features: newFeatures, description: newDescription });
      console.log(`\n[${p.id}] "${p.name}"`);
      if (featuresChanged) {
        console.log(
          `  features: ${p.features.length} -> ${newFeatures.length} (removed ${p.features.length - newFeatures.length})`,
        );
      }
      for (const { before, after } of perParagraph) {
        if (after !== before) {
          console.log(`  description BEFORE: ${before}`);
          console.log(`  description AFTER:  ${after ?? "(paragraph removed entirely)"}`);
        }
      }
    }
  }

  console.log(`\n\n${updates.length} product(s) would be updated.`);

  if (!COMMIT) {
    console.log("\nDry run only — no database changes made. Re-run with --commit to apply.");
    return;
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.product.update({
        where: { id: u.id },
        data: { features: u.features, description: u.description },
      }),
    ),
    { timeout: 60000 },
  );
  console.log(`\nCommitted: updated ${updates.length} product(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
