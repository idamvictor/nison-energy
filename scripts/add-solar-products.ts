/**
 * Adds (or refreshes) the two UKSOL plug-in solar kits in the Solar category.
 * Copy and specs from the client's "Final changes" document. Images are a
 * placeholder until real photos are uploaded in Admin → Solar Panels.
 *
 *   npx tsx scripts/add-solar-products.ts            # dry run
 *   npx tsx scripts/add-solar-products.ts --commit    # apply
 */
import "dotenv/config";

import { prisma } from "../src/lib/db";

type Spec = { section?: string; label: string; value: string };

const PLACEHOLDER = "/media/placeholders/product-placeholder.png";

const microinverterSpecs = (section: string): Spec[] => [
  { section, label: "Max Continuous Output", value: "799VA" },
  { section, label: "MPPT", value: "2 independent channels" },
  { section, label: "Recommended Module Range", value: "300W–730W" },
  { section, label: "Peak Efficiency", value: "96.7%" },
  { section, label: "AC Output", value: "230V, 50Hz, 3.5A max" },
  { section, label: "Protection", value: "IP67, anti-islanding" },
  { section, label: "Communication", value: "WiFi and Bluetooth, smartphone app" },
  { section, label: "Operating Temperature", value: "-40°C to +65°C" },
];

const compliance = (section: string): Spec[] => [
  { section, label: "Standards", value: "BS EN 50549-1, BS EN 62109-1/-2, EN 755-1/-2:2016" },
  { section, label: "Directives", value: "LVD, EMC, RoHS, WEEE" },
  { section, label: "Warranty", value: "10 Year British Warranty (microinverter)" },
];

const products = [
  {
    id: "uksol-plug-in-solar-pro-compact-460w-ground-mount-kit",
    name: "UKSOL Plug-In Solar Pro Compact 460W With Ground Mount Kit",
    sku: "UKS-C1-460-MZ1-UKG",
    price: 814,
    sortOrder: 1,
    tagline:
      "460W plug-in solar kit with ground mount — plug into an outdoor socket and generate clean electricity in your garden or patio.",
    description: [
      "Take control of your home energy bills and generate clean electricity on demand with the UKSOL Pro Compact 460W Ground Mount Kit. Designed as an accessible, hassle-free plug-and-play solution, this system lets you generate renewable power in your garden or patio without complex roof installations or invasive wiring. Set up the Sheffield-built mounting stand in a sunny, unshaded spot, plug the pre-wired connection into a dedicated outdoor three-pin socket, and start feeding self-generated solar energy into your home to reduce costly reliance on the grid.",
      "At the core of the system is a cutting-edge 460W N-Type TOPCon bifacial solar panel, engineered to achieve up to 23% module efficiency. Its dual-glass (glass-glass) architecture captures both direct sunlight on the front and reflected ambient light from below, boosting daily energy harvest even in low-light and typical overcast British weather. Built within a corrosion-resistant anodised aluminium frame, the panel delivers rugged year-round durability and is backed by a comprehensive 10-year British warranty.",
      "Power conversion is managed by an 800W smart microinverter boasting an IP67 weatherproof rating for complete outdoor protection. With integrated Wi-Fi and Bluetooth connectivity, you can link the system to your smartphone to track live solar generation, daily output, and lifetime savings in real time via the companion app.",
      "## Installation & Placement Guidelines",
      "Positioning: For optimal generation, align the panel south-facing at an angle of roughly 35°, clear of trees, fences, or building shadows.",
      "Ground Mount Use Only: Designed specifically for ground/patio placement with suitable ballast weights (e.g., concrete pavers or ballast blocks — not included). Not suitable for balcony or elevated railing installations.",
      "Connection Safety: Plug directly into an RCD-protected outdoor socket. Do not connect via extension cables or coiled cable reels.",
    ],
    features: [
      "Effortless Plug-in Solar: Connects directly into a standard outdoor UK three-pin socket to power home appliances instantly.",
      "High-Yield TOPCon N-Type Bifacial Panel: Up to 23% module efficiency with dual-sided light capture for superior low-light performance.",
      "Smart App Tracking: Built-in Wi-Fi and Bluetooth provide real-time performance monitoring and generation stats on your smartphone.",
      "Heavy-Duty IP67 Microinverter: Commercial grade 800W smart microinverter engineered to withstand harsh wind and rain.",
      "All-in-One Complete Kit: Supplied with a dedicated ground-mounting stand, 2m DC lead, and 4m AC plug-in cable.",
      "British Brand Reliability: Includes 10-year British warranty support for lasting dependability and peace of mind.",
    ],
    specs: [
      { section: "Kit", label: "Kit Contents", value: "1 × 460W panel, 1 × 800W microinverter" },
      { section: "Panel (460W TOPCon N-Type)", label: "Peak Power", value: "460W" },
      { section: "Panel (460W TOPCon N-Type)", label: "Efficiency", value: "23.0%" },
      { section: "Panel (460W TOPCon N-Type)", label: "Cell Type", value: "TOPCon N-Type Monocrystalline, 96 cells" },
      { section: "Panel (460W TOPCon N-Type)", label: "Bifaciality", value: "Up to 80%" },
      {
        section: "Panel (460W TOPCon N-Type)",
        label: "Electrical (STC)",
        value: "Vmp 30.1V, Imp 15.28A, Voc 36.0V, Isc 16.32A",
      },
      { section: "Panel (460W TOPCon N-Type)", label: "Power Tolerance", value: "0 to +5W" },
      { section: "Panel (460W TOPCon N-Type)", label: "Max System Voltage", value: "1500V DC" },
      { section: "Panel (460W TOPCon N-Type)", label: "Max Fuse Rating", value: "35A" },
      {
        section: "Panel (460W TOPCon N-Type)",
        label: "Construction",
        value: "30mm anodised aluminium frame, 2.0mm AR-coated front glass, 2.0mm back glass",
      },
      { section: "Panel (460W TOPCon N-Type)", label: "Junction Box", value: "IP68" },
      { section: "Panel (460W TOPCon N-Type)", label: "Fire Rating", value: "Class C" },
      { section: "Panel (460W TOPCon N-Type)", label: "Operating Temperature", value: "-40°C to +85°C" },
      { section: "Panel (460W TOPCon N-Type)", label: "Dimensions", value: "1762 × 1134 × 30mm" },
      { section: "Panel (460W TOPCon N-Type)", label: "Weight", value: "25.5kg" },
      { section: "Panel (460W TOPCon N-Type)", label: "AC Cable", value: "4m" },
      ...microinverterSpecs("Microinverter (800W Smart)"),
      { section: "Installation and Packaging", label: "Installation Area", value: "Approx. 1.9m × 1.2m (2.3m²)" },
      { section: "Installation and Packaging", label: "Box", value: "1800 × 1180 × 180mm, 41kg" },
      { section: "Installation and Packaging", label: "Note", value: "Not suitable for balconies" },
      ...compliance("Compliance and Warranty"),
    ] satisfies Spec[],
  },
  {
    id: "uksol-890w-pro-duo-plug-in-solar-ground-mount-bundle",
    name: "UKSOL 890w Pro Duo Plug In Solar Panel With Ground Mount Bundle",
    sku: "UKS-D2-890-MZ1-UKG",
    price: 1199,
    sortOrder: 2,
    tagline:
      "890W twin-panel plug-in solar bundle with ground mounts — double the generation, plugged straight into an outdoor socket.",
    description: [
      "Slash your daytime electric bills and generate high-output renewable energy at home with the UKSOL Pro Compact 890W Ground Mount Kit. Delivering double the generation footprint of single-panel systems, this complete plug-in solar package pairs two high-efficiency 445W panels with a smart 800W microinverter. It eliminates the delays, roof scaffolding, and complex electrical work of traditional solar installations—simply secure the dual ground frames in a sunny outdoor area, connect the pre-wired cabling, and plug straight into a dedicated outdoor three-pin socket to instantly offset your home's grid consumption.",
      "The system features twin 445W TOPCon N-Type bifacial solar panels, delivering 890W of total array capacity and up to 22.3% module efficiency. Designed with dual-glass (glass-glass) technology, each module captures direct overhead sunlight while simultaneously harvesting reflected ambient light from the surface below. Encased in rugged anodised aluminium frames, these panels provide exceptional resistance against light-induced degradation (LID) and maintain high yields even during overcast British days.",
      "Grid integration is handled by a compliant 800W smart microinverter with an IP67 weatherproof rating, engineered for continuous outdoor operation in heavy rain and extreme temperatures. Featuring built-in Wi-Fi and Bluetooth connectivity, it pairs seamlessly with your smartphone, giving you real-time visibility into live solar production, daily generation metrics, and cumulative household savings.",
      "## Installation & Placement Guidelines",
      "Positioning for Maximum Yield: Align both panels south-facing at an incline of approximately 35°, free from shading by trees, fences, or outbuildings.",
      "Ground & Patio Placement Only: Specifically designed for ground-level installation using suitable ballast weights (e.g., concrete paving slabs — not included). Not suitable for balconies or wall mounting.",
      "Connection Safety: Plug directly into an RCD-protected outdoor socket. Never connect via extension leads, adaptors, or coiled cable reels.",
    ],
    features: [
      "High-Yield 890W Dual Array: Two 445W N-Type TOPCon panels deliver higher generation potential to power baseline home appliances all day.",
      "Bifacial Glass-Glass Engineering: Up to 22.3% module efficiency with dual-sided light absorption for enhanced low-light performance.",
      "True Plug & Play Setup: Connects directly to a standard external UK socket—no structural roof mounting or certified rewiring required.",
      "Smart Performance Tracking: Integrated Wi-Fi and Bluetooth microinverter syncs with a dedicated app for live and historical generation stats.",
      "Commercial-Grade IP67 Durability: Fully sealed microinverter built to handle punishing UK weather season after season.",
      "10-Year British Warranty: Comprehensive UK-backed warranty coverage for long-term reliability and peace of mind.",
    ],
    specs: [
      { section: "Kit", label: "Kit Contents", value: "2 × 445W panels, 1 × 800W microinverter" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Peak Power", value: "445W per panel (890W total)" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Efficiency", value: "22.3%" },
      {
        section: "Panels (445W TOPCon N-Type, ×2)",
        label: "Cell Type",
        value: "TOPCon N-Type Monocrystalline, 108 cells per panel",
      },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Bifaciality", value: "Up to 80%" },
      {
        section: "Panels (445W TOPCon N-Type, ×2)",
        label: "Electrical (STC)",
        value: "Vmp 33.0V, Imp 13.49A, Voc 39.5V, Isc 14.01A",
      },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Power Tolerance", value: "0 to +5W" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Max System Voltage", value: "1500V DC" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Max Fuse Rating", value: "35A" },
      {
        section: "Panels (445W TOPCon N-Type, ×2)",
        label: "Construction",
        value: "30mm anodised aluminium frame, 2.0mm AR-coated front glass, 2.0mm back glass",
      },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Junction Box", value: "IP68" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Fire Rating", value: "Class C" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Operating Temperature", value: "-40°C to +85°C" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Dimensions", value: "1724 × 1134 × 30mm (per panel)" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Weight", value: "25.5kg per panel" },
      { section: "Panels (445W TOPCon N-Type, ×2)", label: "Cables", value: "4m AC cable, 2m DC extension" },
      ...microinverterSpecs("Microinverter (800W Smart)"),
      { section: "Installation and Packaging", label: "Installation Area", value: "Approx. 3.7m × 1.2m (4.4m²)" },
      { section: "Installation and Packaging", label: "Box", value: "1800 × 1180 × 180mm, 74kg" },
      { section: "Installation and Packaging", label: "Note", value: "Not suitable for balconies" },
      ...compliance("Compliance and Warranty"),
    ] satisfies Spec[],
  },
];

async function main() {
  const commit = process.argv.includes("--commit");
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { id: p.id }, select: { id: true, cardImage: true } });
    const data = {
      category: "Solar" as const,
      name: p.name,
      brand: "UKSOL",
      sku: p.sku,
      colour: "Black",
      price: p.price,
      tagline: p.tagline,
      description: p.description,
      features: p.features,
      specs: p.specs,
      warranty: "10-year British",
      active: true,
      featured: true,
      sortOrder: p.sortOrder,
    };
    console.log(
      `${existing ? "UPDATE" : "CREATE"} ${p.id} — £${p.price.toFixed(2)}, ${p.description.length} paragraphs, ${p.features.length} features, ${p.specs.length} spec rows`,
    );
    if (!commit) continue;
    await prisma.product.upsert({
      where: { id: p.id },
      // Images are only set on create, so photos added in admin are never overwritten.
      create: { id: p.id, ...data, cardImage: PLACEHOLDER, gallery: [PLACEHOLDER] },
      update: data,
    });
  }
  console.log(commit ? "Committed." : "Dry run — re-run with --commit to apply.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
