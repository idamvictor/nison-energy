import type { ProductDetail } from "@/lib/product-details";
import { accessoryProducts } from "@/lib/accessory-products";

const features = [
  "Dirt and heat resistant — IP55 protection when connected",
  "Available in any length",
  "Supplied with protective fitted cap",
  "Straight, coiled or combination cable",
  "TÜV certified connectors — IEC/EN62196",
  "Colour choice",
  "Impact resistant",
  "Compliant with all battery electric and plug-in hybrid vehicles",
  "UV resistant",
  "Compliant with home, workplace and public charge points with a Type 2 socket",
  "Highly flexible",
  "Tethered cables compliant with vehicles with a Type 2 or Type 1 inlet",
  "Lightweight design",
];

const sharedSpecs = [
  { label: "Connector Type", value: "Type2–Type2" },
  { label: "Certification", value: "TÜV Certified IEC/EN62196" },
  { label: "Conductor Material", value: "Plain copper (BS EN 60228)" },
  { label: "Core Insulation", value: "TPR" },
  { label: "Outer Sheath", value: "Polyurethane EVM-1P" },
  { label: "IP Rating", value: "IP55 (when connected)" },
  { label: "Temperature Range", value: "-40°C to +90°C" },
  { label: "Rated Voltage & Amps", value: "450/750V, 32A" },
];

const threePhaseSpecs = [
  { label: "Number of Cores", value: "6 (three phase)" },
  { label: "Conductor Size", value: "5 × 6.00mm² & 1 × 0.75mm²" },
  { label: "Cable Diameter", value: "16.00mm" },
  { label: "Bend Radius", value: "31.00mm" },
  { label: "AC Charging Rate", value: "Up to 22kW" },
];

const singlePhaseSpecs = [
  { label: "Number of Cores", value: "4 (single phase)" },
  { label: "Conductor Size", value: "3 × 6.00mm² & 1 × 0.75mm²" },
  { label: "Cable Diameter", value: "14.00mm" },
  { label: "Bend Radius", value: "25.00mm" },
  { label: "AC Charging Rate", value: "Up to 7.2kW" },
];

const description = [
  "Built for daily use on driveways, car parks and commercial sites alike, this Type2–Type2 cable is dirt, heat and UV resistant with a TÜV-certified connector at each end.",
  "Choose discreet grey for a low-key look or hi-vis lime green for better visibility on shared or public charging bays — both come with a protective fitted cap and hold up to IP55 once connected.",
];

export function getAccessoryDetail(productId: string): ProductDetail | undefined {
  const product = accessoryProducts.find((p) => p.id === productId);
  if (!product) return undefined;

  return {
    tagline: `${product.phase} · ${product.style} · ${product.colour}`,
    gallery: [product.image],
    description,
    features,
    specs: [
      ...sharedSpecs,
      ...(product.phase === "3 Phase" ? threePhaseSpecs : singlePhaseSpecs),
      { label: "Length Options", value: product.lengthOptions.join(", ") },
      { label: "Colour", value: product.colour },
    ],
    warranty: "Not specified by manufacturer",
  };
}
