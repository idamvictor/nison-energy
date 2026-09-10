import type { Prisma } from "../src/generated/prisma/client";

// The catalog, moved off the static src/lib/*.ts files. Loaded into the
// `Product` table by prisma/seed.ts. `sortOrder` follows array order; the first
// three of each category are `featured` (matches the old home-page `.slice(0,3)`).

const IMG = "https://ocunioenergy.com/wp-content/uploads";
const ACC_IMG = "https://ocunioenergy.com/wp-content/uploads/2025/05";
const accImages = {
  greyCoiled: `${ACC_IMG}/ZEV_Grey-Coil-min-scaled.png`,
  greyStraight: `${ACC_IMG}/ZEV_Grey_Straight-2-min-scaled.png`,
  greenCoiled: `${ACC_IMG}/ZEV_Green-Coil-min-1-scaled.png`,
  greenStraight: `${ACC_IMG}/ZEV_Green_Straight_Cap-On-1-min-scaled.png`,
};

type Spec = { label: string; value: string };

type SeedProduct = {
  id: string;
  category: "Residential" | "Commercial" | "Accessory";
  name: string;
  brand: string;
  colour: string;
  cardImage: string;
  tags?: string[];
  variantGroup?: string;
  spec?: string;
  connectionType?: string;
  cableLength?: string;
  powerOutput?: string;
  price?: number;
  cableLengthOptions?: string[];
  compatibleTariffs?: string[];
  style?: string;
  phase?: string;
  lengthOptions?: string[];
  tagline?: string;
  gallery?: string[];
  description?: string[];
  features?: string[];
  specs?: Spec[];
  warranty?: string;
};

const residential: SeedProduct[] = [
  {
    id: "easee-one",
    category: "Residential",
    name: "Easee One 7.4kW Smart Charger",
    brand: "Easee",
    colour: "Black",
    cardImage: `${IMG}/2025/05/easee-one-ev-charger-8.jpg`,
    tags: ["Ocunio recommends", "Free UK delivery"],
    spec: "7.4kW · Type 2 · Untethered · WiFi & 4G",
    connectionType: "Untethered",
    powerOutput: "7.4kW",
    price: 980,
    tagline:
      "The future of home EV charging — compact, connected and effortlessly smart.",
    gallery: [
      `${IMG}/2025/05/easee-one-ev-charger-8.jpg`,
      `${IMG}/2025/05/easee-one-1.jpg`,
      `${IMG}/2025/05/easee-one-2.jpg`,
      `${IMG}/2025/05/easee-one-3.jpg`,
    ],
    description: [
      "The Easee One brings smart, connected charging to your driveway in one of the smallest footprints on the market — designed to disappear into your home rather than dominate it.",
      "Built-in 4G and WiFi mean it's online from the moment it's installed, with dynamic load and phase balancing keeping your home's supply safe even with multiple chargers on one fuse.",
    ],
    features: [
      "7.4kW charging capacity (single phase)",
      "Universal compatibility with all Type 2 electric vehicles",
      "Smart charging with WiFi, 4G and Bluetooth connectivity",
      "Integrated load balancing — supports up to 3 Easee chargers on a single fuse",
      "No earth rod required — built-in open PEN protection",
      "Easee App — control charging, monitor energy use, lock/unlock remotely",
      "Weatherproof and durable — rated IP54 for outdoor use",
      "Built-in RFID reader for secure access control",
      "Integrated eSIM with free lifetime 4G connectivity",
    ],
    specs: [
      { label: "Output Power", value: "7.4kW" },
      { label: "Connectivity", value: "WiFi, 4G, Bluetooth" },
      { label: "Connection Type", value: "Untethered, Type 2 socket" },
      { label: "IP Rating", value: "IP54" },
      { label: "Dimensions (HxWxD)", value: "256mm x 193mm x 106mm" },
      { label: "Weight", value: "1.5kg" },
      { label: "Mounting", value: "Wall or post" },
    ],
    warranty: "3 year manufacturer warranty",
  },
  {
    id: "hypervolt-white",
    category: "Residential",
    name: "Hypervolt Home Pro 3",
    brand: "Hypervolt",
    colour: "White",
    cardImage: `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white.webp`,
    tags: ["Free UK delivery"],
    variantGroup: "hypervolt-home-pro-3",
    spec: "7.4kW · Type 2 tethered · 5m cable · White",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "7.5m", "10m"],
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 1064,
    tagline: "Smart. Stylish. Future-ready.",
    gallery: [
      `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white.webp`,
      `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white-2.webp`,
      `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white-7.webp`,
    ],
    description: [
      "The Hypervolt Home Pro 3 pairs a slim, minimal design with genuinely useful smart features — solar integration, off-peak scheduling and Alexa voice control, all managed from one app.",
      "Built-in PEN fault protection means no earth rod is needed for most installations, keeping fitting quick and disruption to your driveway to a minimum.",
    ],
    features: [
      "Smart charging — schedule around off-peak rates automatically",
      "Solar integration — charge using 100% renewable energy from your panels",
      "Voice control — integrates with Alexa",
      "Free over-the-air software updates",
      "No earth rod required — built-in open PEN protection",
      "Mobile app control — usage, access and scheduling in one place",
      "Load management — balances power usage to prevent overload",
      "Durable and weatherproof — IP66 rated",
    ],
    specs: [
      { label: "Output Power", value: "Up to 7.4kW (single-phase)" },
      { label: "Connectivity", value: "WiFi, Ethernet, Bluetooth" },
      { label: "Connection Type", value: "Tethered, 5m Type 2 cable" },
      { label: "Protection", value: "PEN fault detection, RCD Type A, 6mA DC" },
      { label: "IP Rating", value: "IP66" },
      { label: "Dimensions (HxWxD)", value: "328mm x 243mm x 101mm" },
      { label: "Weight", value: "5.5kg" },
    ],
    warranty: "3 year manufacturer warranty (extendable)",
  },
  {
    id: "hypervolt-grey",
    category: "Residential",
    name: "Hypervolt Home Pro 3",
    brand: "Hypervolt",
    colour: "Space Grey",
    cardImage: `${IMG}/2025/05/hypervolt-7kw-ev-charger-space-grey-3.webp`,
    tags: ["Free UK delivery"],
    variantGroup: "hypervolt-home-pro-3",
    spec: "7.4kW · Type 2 tethered · 5m cable · Space Grey",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "7.5m", "10m"],
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 1079,
    tagline: "Smart. Stylish. Future-ready.",
    gallery: [
      `${IMG}/2025/05/hypervolt-7kw-ev-charger-space-grey-3.webp`,
      `${IMG}/2025/05/hypervolt-7kw-ev-charger-space-grey-5.webp`,
      `${IMG}/2025/05/hypervolt-app-2_2.webp`,
    ],
    description: [
      "The Hypervolt Home Pro 3 pairs a slim, minimal design with genuinely useful smart features — solar integration, off-peak scheduling and Alexa voice control, all managed from one app.",
      "Built-in PEN fault protection means no earth rod is needed for most installations, keeping fitting quick and disruption to your driveway to a minimum.",
    ],
    features: [
      "Smart charging — schedule around off-peak rates automatically",
      "Solar integration — charge using 100% renewable energy from your panels",
      "Voice control — integrates with Alexa",
      "Free over-the-air software updates",
      "No earth rod required — built-in open PEN protection",
      "Mobile app control — usage, access and scheduling in one place",
      "Load management — balances power usage to prevent overload",
      "Durable and weatherproof — IP66 rated",
    ],
    specs: [
      { label: "Output Power", value: "Up to 7.4kW (single-phase)" },
      { label: "Connectivity", value: "WiFi, Ethernet, Bluetooth" },
      { label: "Connection Type", value: "Tethered, 5m Type 2 cable" },
      { label: "Protection", value: "PEN fault detection, RCD Type A, 6mA DC" },
      { label: "IP Rating", value: "IP66" },
      { label: "Dimensions (HxWxD)", value: "328mm x 243mm x 101mm" },
      { label: "Weight", value: "5.5kg" },
    ],
    warranty: "3 year manufacturer warranty (extendable)",
  },
  {
    id: "indra-lux-black",
    category: "Residential",
    name: "Indra Smart LUX",
    brand: "Indra",
    colour: "Black",
    cardImage: `${IMG}/2025/05/indra-smart-lux-ev-charger-black.webp`,
    tags: ["Ocunio recommends", "3 year warranty"],
    variantGroup: "indra-smart-lux",
    spec: "7.4kW · Type 2 tethered · 6m cable · Black",
    connectionType: "Tethered",
    cableLength: "6m",
    cableLengthOptions: ["6m", "10m"],
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 1050,
    tagline: "Smarter charging, lower costs.",
    gallery: [
      `${IMG}/2025/05/indra-smart-lux-ev-charger-black.webp`,
      `${IMG}/2025/08/indra-smart-lux-ev-charger-bottom.webp`,
      `${IMG}/2025/08/indra-smart-lux-ev-charger-in-situ.webp`,
      `${IMG}/2025/08/indra-smart-lux-ev-charger-in-situ-2.webp`,
    ],
    description: [
      "At just 78mm deep, the Indra Smart LUX is one of the slimmest chargers on the market — designed for narrow driveways and minimalist exteriors alike.",
      "It integrates with off-peak tariffs like Intelligent Octopus Go to schedule charging automatically for the cheapest times, and connects to solar panels to cut grid reliance further.",
      "The Indra app gives full control over sessions, limits and history, with RFID tap-to-start and remote app locking for added security.",
    ],
    features: [
      "6 metre tethered Type 2 cable",
      "Charge from solar panels or directly from the grid",
      "Integrates with all electricity tariffs to help keep costs low",
      "App control — charge status, scheduling, history, remote lock",
      "RFID compatible",
      "LED lights display charge status",
      "Slim profile design — just 78mm deep",
      "WiFi, 4G and Ethernet connectivity",
      "Over-the-air updates",
    ],
    specs: [
      { label: "Output Power", value: "7.4kW" },
      { label: "Connection Type", value: "Tethered, 6m Type 2 cable" },
      { label: "Connectivity", value: "WiFi, 4G, Ethernet" },
      { label: "IP Rating", value: "IP67" },
      { label: "IK Rating", value: "IK10" },
      { label: "Operating Temperature", value: "-20°C to +50°C" },
      { label: "Rated Current", value: "32A max" },
      { label: "Standby Power Consumption", value: "5W" },
      { label: "Dimensions (HxWxD)", value: "306mm x 201mm x 78mm" },
    ],
    warranty: "3 year manufacturer warranty",
  },
  {
    id: "indra-lux-white",
    category: "Residential",
    name: "Indra Smart LUX",
    brand: "Indra",
    colour: "White",
    cardImage: `${IMG}/2025/08/indra-smart-lux-white-4.webp`,
    tags: ["3 year warranty"],
    variantGroup: "indra-smart-lux",
    spec: "7.4kW · Type 2 tethered · 6m cable · White",
    connectionType: "Tethered",
    cableLength: "6m",
    cableLengthOptions: ["6m", "10m"],
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 1050,
    tagline: "Smarter charging, lower costs.",
    gallery: [`${IMG}/2025/08/indra-smart-lux-white-4.webp`],
    description: [
      "At just 78mm deep, the Indra Smart LUX is one of the slimmest chargers on the market — designed for narrow driveways and minimalist exteriors alike.",
      "It integrates with off-peak tariffs like Intelligent Octopus Go to schedule charging automatically for the cheapest times, and connects to solar panels to cut grid reliance further.",
      "The Indra app gives full control over sessions, limits and history, with RFID tap-to-start and remote app locking for added security.",
    ],
    features: [
      "6 metre tethered Type 2 cable",
      "Charge from solar panels or directly from the grid",
      "Integrates with all electricity tariffs to help keep costs low",
      "App control — charge status, scheduling, history, remote lock",
      "RFID compatible",
      "LED lights display charge status",
      "Slim profile design — just 78mm deep",
      "WiFi, 4G and Ethernet connectivity",
      "Over-the-air updates",
    ],
    specs: [
      { label: "Output Power", value: "7.4kW" },
      { label: "Connection Type", value: "Tethered, 6m Type 2 cable" },
      { label: "Connectivity", value: "WiFi, 4G, Ethernet" },
      { label: "IP Rating", value: "IP67" },
      { label: "IK Rating", value: "IK10" },
      { label: "Operating Temperature", value: "-20°C to +50°C" },
      { label: "Rated Current", value: "32A max" },
      { label: "Standby Power Consumption", value: "5W" },
      { label: "Dimensions (HxWxD)", value: "306mm x 201mm x 78mm" },
    ],
    warranty: "3 year manufacturer warranty",
  },
  {
    id: "indra-pro-black",
    category: "Residential",
    name: "Indra Smart Pro Untethered",
    brand: "Indra",
    colour: "Black",
    cardImage: `${IMG}/2025/08/Indra-black-Front-view-scaled.jpg`,
    tags: ["Free UK delivery"],
    spec: "7.4kW · Type 2 socket · Black · App control",
    connectionType: "Untethered",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 902,
    tagline: "The ideal choice for modern EV drivers.",
    gallery: [
      `${IMG}/2025/08/Indra-black-Front-view-scaled.jpg`,
      `${IMG}/2025/08/Indra-black-Front-view-1-scaled.jpg`,
      `${IMG}/2025/08/Indra-_black-Side-View-scaled.jpg`,
      `${IMG}/2025/08/Indra-black-Side-Angle-R-scaled.webp`,
      `${IMG}/2025/05/indra-pro-untethered-ev-charger-in-situ-1.webp`,
    ],
    description: [
      "Designed and built in the UK, the Indra Smart Pro combines cutting-edge scheduling technology with everyday convenience for a genuinely hassle-free charging experience.",
      "Fully compatible with tariffs like Intelligent Octopus Go, it automatically prioritises the cheapest and greenest energy available — whether that's off-peak grid power or your own solar panels.",
      "Manage sessions by miles, cost or kWh in the Indra app, with RFID access and app-based locking keeping the charger secure.",
    ],
    features: [
      "7kW untethered EV charger, Type 2 socket",
      "Charge from solar panels or directly from the grid",
      "Integrates with all electricity tariffs to help keep costs low",
      "App control — charge status, scheduling, history, remote lock",
      "RFID compatible",
      "WiFi and Ethernet connectivity",
      "Load curtailment and over-the-air updates",
    ],
    specs: [
      { label: "Output Power", value: "7.4kW" },
      { label: "Connection Type", value: "Untethered, Type 2 socket" },
      { label: "Connectivity", value: "WiFi, Ethernet" },
      { label: "IP Rating", value: "IP65" },
      { label: "IK Rating", value: "IK10" },
      { label: "Operating Temperature", value: "-20°C to +50°C" },
      { label: "Rated Current", value: "32A max" },
      { label: "Standby Power Consumption", value: "5W" },
      { label: "Dimensions (HxWxD)", value: "421mm x 200mm x 143mm" },
    ],
    warranty: "3 year manufacturer warranty",
  },
  {
    id: "ohme-home-pro",
    category: "Residential",
    name: "Ohme Home Pro",
    brand: "Ohme",
    colour: "Black",
    cardImage: `${IMG}/2025/05/Ohme-home_pro_1.png`,
    tags: ["Ocunio recommends", "Free UK delivery"],
    spec: "7.4kW · Type 2 tethered · 5m cable · Smart tariff ready",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "8m"],
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    powerOutput: "7.4kW",
    price: 1077,
    tagline:
      "Smart charging made simple — power your drive the intelligent way.",
    gallery: [
      `${IMG}/2025/05/Ohme-home_pro_1.png`,
      `${IMG}/2025/05/OhmeHomeProandcable.jpg`,
      `${IMG}/2025/05/ohme-home-pro-ohme002gb002-8m-7kw-ev-charger.jpg`,
    ],
    description: [
      "The Ohme Home Pro pairs an interactive LCD screen with full app connectivity, helping you charge when electricity is cheapest and greenest without lifting a finger.",
      "Built for drivers who want more than plug-and-go, it works with tariffs like Octopus Agile and Intelligent to schedule charging around your lifestyle.",
    ],
    features: [
      "Smart tariff integration — works with Octopus Agile & Intelligent",
      "App controlled — schedule, track and monitor from your phone",
      "Interactive LCD screen — charge status and scheduling on the unit",
      "Type 2 tethered cable included",
      "Built-in safety features — overcurrent, earth fault and temperature protection",
      "Compatible with all EVs and plug-in hybrids via Type 2",
      "Wall mounted, sleek and compact design",
    ],
    specs: [
      { label: "Output Power", value: "7.4kW (single phase)" },
      { label: "Connectivity", value: "4G, WiFi, Ethernet" },
      { label: "Display", value: "Interactive LCD screen" },
      { label: "Connection Type", value: "Tethered Type 2 cable" },
      { label: "Dimensions (HxWxD)", value: "200mm x 170mm x 100mm" },
    ],
    warranty: "3 year manufacturer warranty",
  },
  {
    id: "ohme-epod",
    category: "Residential",
    name: "Ohme ePod",
    brand: "Ohme",
    colour: "Matte Black",
    cardImage: `${IMG}/2025/05/Ohme-epod.jpg`,
    tags: ["Free UK delivery"],
    spec: "7.4kW · Compact wall unit · Type 2 · Untethered",
    connectionType: "Untethered",
    powerOutput: "7.4kW",
    price: 957,
    tagline: "The compact, smart EV charger built for the future of driving.",
    gallery: [
      `${IMG}/2025/05/Ohme-epod.jpg`,
      `${IMG}/2025/05/Ohme_epod-2.png`,
      `${IMG}/2025/05/06d6485a-9405-4c82-8a76-bfce01d181d6.png`,
    ],
    description: [
      "The Ohme ePod is a powerful, minimalist charger designed to blend into any home while still delivering genuinely smart charging.",
      "It connects to your energy tariff automatically, charging when electricity is cheapest and greenest, with built-in 4G and WiFi meaning no external SIM or router is ever needed.",
    ],
    features: [
      "Works with any EV or plug-in hybrid via Type 2 socket",
      "Smart app control — schedule, monitor and set cost limits",
      "Tariff-optimised charging at off-peak, lowest rates",
      "Automatically favours the lowest-carbon energy available",
      "Built-in 4G and WiFi — no external SIM or router needed",
      "Sleek, compact wall-mounted design",
      "Built-in safety — PEN fault detection, overcurrent, temperature monitoring",
    ],
    specs: [
      { label: "Output Power", value: "Up to 7.4kW (single-phase)" },
      { label: "Connection Type", value: "Untethered, Type 2 socket" },
      { label: "Connectivity", value: "4G, WiFi, Ethernet" },
      { label: "Colour", value: "Matte black" },
      { label: "Dimensions (HxWxD)", value: "230mm x 140mm x 100mm" },
      { label: "Certifications", value: "OLEV, CE marked" },
    ],
    warranty: "3 year manufacturer warranty",
  },
];

const commercialModelDetail: Record<
  string,
  Pick<SeedProduct, "tagline" | "gallery" | "description" | "features" | "specs" | "warranty">
> = {
  "easee-max-charge": {
    tagline:
      "Bring power, intelligence, and future-proof innovation to your charging infrastructure.",
    gallery: [
      `${IMG}/2025/05/easee-charge-max-front-use-this-photo.webp`,
      `${IMG}/2025/05/easee-charge-max-back-use-this-photo.webp`,
      `${IMG}/2025/05/easee-charge-max-in-use-this-photo.webp`,
      `${IMG}/2025/05/easee-charge-max-main-use-this-photo.webp`,
      `${IMG}/2025/05/easee-charge-max-top-use-this-photo.webp`,
    ],
    description: [
      "Easee Max Charge is built for businesses that need more than a single charger — dynamic load balancing lets you run multiple units off the same electrical supply without costly upgrades.",
      "Customisable front covers and app-based user management make it easy to control who charges, when, and how reimbursement for company vehicles and guest access works.",
    ],
    features: [
      "Ultra-fast charging up to 22kW with three-phase supply",
      "Dynamic load balancing across multiple chargers",
      "Smart connectivity — 4G (e-SIM), WiFi and RFID reader included",
      "Over-the-air updates keep the charger future-proof",
      "Weatherproof and impact-resistant — IP54, IK10 rated",
      "Simplifies reimbursement for company vehicles and guest access",
      "Customisable colours — choice of front covers available",
      "Secure access control — RFID authentication and app-based user management",
    ],
    specs: [
      { label: "Power Output", value: "1.4–22kW (1-phase and 3-phase)" },
      { label: "Connection Type", value: "Untethered, Type 2 socket" },
      { label: "Input Voltage", value: "230V–400V AC" },
      { label: "Connectivity", value: "4G LTE, WiFi, Bluetooth, Easee Link™" },
      { label: "IP Rating", value: "IP54" },
      { label: "IK Rating", value: "IK10" },
      { label: "Dimensions (HxWxD)", value: "256mm x 193mm x 106mm" },
      { label: "Weight", value: "1.5kg" },
      { label: "Operating Temperature", value: "-30°C to +50°C" },
      { label: "Mounting", value: "Wall or pole-mounted" },
    ],
    warranty: "Manufacturer warranty",
  },
  "vchrgd-twentytwo": {
    tagline: "Business-ready smart charging for the future.",
    gallery: [`${IMG}/2025/05/3.png`, `${IMG}/2025/05/4-1.png`],
    description: [
      "The VCHRGD TwentyTwo charges two vehicles at once from independent 22kW outputs, without compromising on speed for either driver.",
      "OCPP 1.6J compatibility means it drops straight into any existing backend management platform, with weatherproof, vandal-resistant housing built for busy commercial sites.",
    ],
    features: [
      "Charge two EVs simultaneously with independent 22kW outputs",
      "Balances energy usage across multiple chargers",
      "OCPP 1.6J for integration into any backend management platform",
      "Weather-resistant, vandal-proof housing for busy business environments",
      "Public or private charging with RFID access control or app integration",
      "LED status indicators with intuitive app support",
      "Dynamic load balancing and smart energy distribution to reduce costs",
    ],
    specs: [
      { label: "Charging Capacity", value: "2×22kW AC (three-phase)" },
      { label: "Connector Type", value: "Dual Type 2 sockets" },
      { label: "Input Voltage", value: "400V AC 50Hz" },
      { label: "Current Rating", value: "32A per outlet" },
      { label: "Connectivity", value: "Ethernet, WiFi, 4G (optional)" },
      { label: "Communication Protocol", value: "OCPP 1.6J" },
      { label: "IP Rating", value: "IP54" },
      { label: "IK Rating", value: "IK10" },
      { label: "Operating Temperature", value: "-25°C to +50°C" },
      { label: "Dimensions (HxWxD)", value: "600mm x 400mm x 250mm" },
      { label: "Mounting", value: "Wall or pedestal-mounted" },
    ],
    warranty: "3 year warranty (extendable)",
  },
  "zaptec-pro-mid": {
    tagline: "Smart, scalable commercial charging.",
    gallery: [
      `${IMG}/2025/05/Zaptec-Pro.webp`,
      `${IMG}/2025/05/Zaptec-Pro_Portal_2023-11-30-115234_lhhs.webp`,
      `${IMG}/2025/05/Zaptec-Pro_underground-car-park_Germany_7-1.webp`,
      `${IMG}/2025/05/Zaptec_Pro-september-43-scaled-1.webp`,
    ],
    description: [
      "Zaptec Pro MID ships with a MID-certified meter built in, so you can bill for exact energy usage with confidence — ideal for shared car parks and fleet depots.",
      "Dynamic load balancing automatically optimises available energy across every charge point on site, with real-time management via the Zaptec Portal and app.",
    ],
    features: [
      "Flexible charging speeds — adjustable output between 7kW and 22kW",
      "MID-certified meter for precise, billable energy measurement",
      "Dynamic load balancing across multiple charge points",
      "Cloud-connected smart control via Zaptec Portal and app",
      "Secure access via RFID cards or mobile app",
      "OCPP 1.6 compatibility with third-party management systems",
      "Designed for scalability as your site grows",
      "Built for harsh environments — IP54-rated, tested for extreme weather",
    ],
    specs: [
      { label: "Power Output", value: "7–22kW (AC, three-phase and single-phase)" },
      { label: "Connection Type", value: "Untethered, Type 2 socket" },
      { label: "Input Voltage", value: "230V / 400V AC" },
      { label: "Current", value: "Adjustable up to 32A" },
      { label: "Connectivity", value: "Ethernet, WiFi, 4G LTE (optional)" },
      { label: "IP Rating", value: "IP54" },
      { label: "IK Rating", value: "IK10" },
      { label: "Operating Temperature", value: "-30°C to +50°C" },
      { label: "Dimensions (HxWxD)", value: "392mm x 258mm x 112mm" },
      { label: "Weight", value: "5.5kg" },
      { label: "Mounting", value: "Wall or pole-mounted" },
    ],
    warranty: "5 year warranty",
  },
  "zappi-22kw": {
    tagline:
      "The world's first solar-compatible EV charger — smart, sustainable and stylish.",
    gallery: [
      `${IMG}/2025/06/Zappi_myenergi-zappi-22kw-type-2-tethered-ev-charger-black-2.jpg`,
    ],
    description: [
      "Zappi combines intelligent energy optimisation with renewable compatibility, charging from the grid or straight from your site's solar panels to cut both cost and carbon footprint.",
      "Manufactured in the UK by myenergi, it offers three charging modes and full app control, with dynamic load balancing keeping multiple chargers safe on one supply.",
    ],
    features: [
      "Compatible with solar PV and wind turbine systems",
      "Three charging modes: Eco, Eco+ and Fast",
      "Dynamic load balancing for safe energy usage",
      "Integrated programmable timer functions",
      "Built-in PEN fault protection — no earth rods needed",
      "Smart scheduling to charge during off-peak hours",
      "Remote control via the myenergi app",
      "Pin code lock for added security",
      "WiFi and Ethernet connectivity as standard",
      "Over-the-air firmware updates",
    ],
    specs: [
      { label: "Power Output", value: "22kW (three-phase)" },
      { label: "Connectivity", value: "WiFi, Ethernet" },
      { label: "IP Rating", value: "IP65" },
      { label: "Display", value: "Built-in LCD display" },
      { label: "Dimensions (HxWxD)", value: "439mm x 282mm x 122mm" },
    ],
    warranty: "Manufacturer warranty",
  },
};

const commercialBase: (Omit<
  SeedProduct,
  "tagline" | "gallery" | "description" | "features" | "specs" | "warranty"
> & { model: string })[] = [
  {
    id: "easee-max-charge",
    category: "Commercial",
    name: "Easee Max Charge Multiphase EV Charger",
    brand: "Easee",
    colour: "Anthracite",
    cardImage: `${IMG}/2025/05/easee-charge-max-front-use-this-photo.webp`,
    tags: ["Ocunio recommends"],
    spec: "22kW · Type 2 socket · Untethered · 4G/WiFi/RFID",
    connectionType: "Untethered",
    powerOutput: "22kW",
    price: 1634,
    model: "easee-max-charge",
  },
  {
    id: "vchrgd-twentytwo",
    category: "Commercial",
    name: "VCHRGD TwentyTwo Dual 22kW EV Charger",
    brand: "VCHRGD",
    colour: "Black",
    cardImage: `${IMG}/2025/05/3.png`,
    tags: ["Dual outlet"],
    spec: "22kW · Dual Type 2 sockets · Untethered · OCPP 1.6J",
    connectionType: "Untethered",
    powerOutput: "22kW",
    price: 2250,
    model: "vchrgd-twentytwo",
  },
  {
    id: "zaptec-pro-mid",
    category: "Commercial",
    name: "Zaptec Pro MID EV Charger",
    brand: "Zaptec",
    colour: "Anthracite Grey",
    cardImage: `${IMG}/2025/05/Zaptec-Pro.webp`,
    tags: ["5 year warranty"],
    spec: "7–22kW · Type 2 socket · Untethered · MID-certified meter",
    connectionType: "Untethered",
    powerOutput: "7–22kW",
    price: 1547,
    model: "zaptec-pro-mid",
  },
  {
    id: "zappi-tethered-black",
    category: "Commercial",
    name: "Zappi 22kW Multiphase",
    brand: "myenergi",
    colour: "Black",
    cardImage: `${IMG}/2025/06/Zappi_myenergi-zappi-22kw-type-2-tethered-ev-charger-black-2.jpg`,
    tags: ["Ocunio recommends", "Solar compatible"],
    variantGroup: "zappi-22kw",
    spec: "22kW · Type 2 tethered · 10m cable · Black",
    connectionType: "Tethered",
    cableLength: "10m",
    powerOutput: "22kW",
    price: 1296,
    model: "zappi-22kw",
  },
  {
    id: "zappi-tethered-white",
    category: "Commercial",
    name: "Zappi 22kW Multiphase",
    brand: "myenergi",
    colour: "White",
    cardImage: `${IMG}/2025/06/Zappi-22kW-3-tethered-Phase-Electric-Car-Charger-for-Home-Side-Angle-White.jpg`,
    tags: ["Solar compatible"],
    variantGroup: "zappi-22kw",
    spec: "22kW · Type 2 tethered · 10m cable · White",
    connectionType: "Tethered",
    cableLength: "10m",
    powerOutput: "22kW",
    price: 1296,
    model: "zappi-22kw",
  },
  {
    id: "zappi-untethered-black",
    category: "Commercial",
    name: "Zappi 22kW Multiphase Untethered",
    brand: "myenergi",
    colour: "Black",
    cardImage: `${IMG}/2025/05/zappi-22kw-type-2-untethered-ev-charger-black-2.webp`,
    tags: ["Solar compatible"],
    variantGroup: "zappi-22kw",
    spec: "22kW · Type 2 socket · Untethered · Black",
    connectionType: "Untethered",
    powerOutput: "22kW",
    price: 1296,
    model: "zappi-22kw",
  },
  {
    id: "zappi-untethered-white",
    category: "Commercial",
    name: "Zappi 22kW Multiphase Untethered",
    brand: "myenergi",
    colour: "White",
    cardImage: `${IMG}/2025/05/zappi-22kw-type-2-untethered-ev-charger-white.webp`,
    tags: ["Solar compatible"],
    variantGroup: "zappi-22kw",
    spec: "22kW · Type 2 socket · Untethered · White",
    connectionType: "Untethered",
    powerOutput: "22kW",
    price: 1296,
    model: "zappi-22kw",
  },
];

const commercial: SeedProduct[] = commercialBase.map(({ model, ...base }) => ({
  ...base,
  ...commercialModelDetail[model],
}));

// Accessory detail content — was computed by getAccessoryDetail(); baked in here.
const accFeatures = [
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
const accSharedSpecs: Spec[] = [
  { label: "Connector Type", value: "Type2–Type2" },
  { label: "Certification", value: "TÜV Certified IEC/EN62196" },
  { label: "Conductor Material", value: "Plain copper (BS EN 60228)" },
  { label: "Core Insulation", value: "TPR" },
  { label: "Outer Sheath", value: "Polyurethane EVM-1P" },
  { label: "IP Rating", value: "IP55 (when connected)" },
  { label: "Temperature Range", value: "-40°C to +90°C" },
  { label: "Rated Voltage & Amps", value: "450/750V, 32A" },
];
const accThreePhaseSpecs: Spec[] = [
  { label: "Number of Cores", value: "6 (three phase)" },
  { label: "Conductor Size", value: "5 × 6.00mm² & 1 × 0.75mm²" },
  { label: "Cable Diameter", value: "16.00mm" },
  { label: "Bend Radius", value: "31.00mm" },
  { label: "AC Charging Rate", value: "Up to 22kW" },
];
const accSinglePhaseSpecs: Spec[] = [
  { label: "Number of Cores", value: "4 (single phase)" },
  { label: "Conductor Size", value: "3 × 6.00mm² & 1 × 0.75mm²" },
  { label: "Cable Diameter", value: "14.00mm" },
  { label: "Bend Radius", value: "25.00mm" },
  { label: "AC Charging Rate", value: "Up to 7.2kW" },
];
const accDescription = [
  "Built for daily use on driveways, car parks and commercial sites alike, this Type2–Type2 cable is dirt, heat and UV resistant with a TÜV-certified connector at each end.",
  "Choose discreet grey for a low-key look or hi-vis lime green for better visibility on shared or public charging bays — both come with a protective fitted cap and hold up to IP55 once connected.",
];

const accessoryBase: {
  id: string;
  name: string;
  colour: string;
  style: "Coiled" | "Straight";
  phase: "Single Phase" | "3 Phase";
  lengthOptions: string[];
  variantGroup: string;
  tags: string[];
  image: string;
}[] = [
  { id: "zev-3phase-coiled-grey", name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Coiled", colour: "Discreet Grey", style: "Coiled", phase: "3 Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-3phase", tags: ["Ocunio recommends"], image: accImages.greyCoiled },
  { id: "zev-3phase-coiled-green", name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Coiled", colour: "Hi-vis Lime Green", style: "Coiled", phase: "3 Phase", lengthOptions: ["5m", "7.5m"], variantGroup: "zev-3phase", tags: [], image: accImages.greenCoiled },
  { id: "zev-3phase-straight-grey", name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Straight", colour: "Discreet Grey", style: "Straight", phase: "3 Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-3phase", tags: [], image: accImages.greyStraight },
  { id: "zev-3phase-straight-green", name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Straight", colour: "Hi-vis Lime Green", style: "Straight", phase: "3 Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-3phase", tags: [], image: accImages.greenStraight },
  { id: "zev-single-coiled-grey", name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Coiled", colour: "Discreet Grey", style: "Coiled", phase: "Single Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-single", tags: ["Ocunio recommends"], image: accImages.greyCoiled },
  { id: "zev-single-coiled-green", name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Coiled", colour: "Hi-vis Lime Green", style: "Coiled", phase: "Single Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-single", tags: [], image: accImages.greenCoiled },
  { id: "zev-single-straight-grey", name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Straight", colour: "Discreet Grey", style: "Straight", phase: "Single Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-single", tags: [], image: accImages.greyStraight },
  { id: "zev-single-straight-green", name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Straight", colour: "Hi-vis Lime Green", style: "Straight", phase: "Single Phase", lengthOptions: ["5m", "10m"], variantGroup: "zev-single", tags: [], image: accImages.greenStraight },
];

const accessories: SeedProduct[] = accessoryBase.map((a) => ({
  id: a.id,
  category: "Accessory",
  name: a.name,
  brand: "ZEV",
  colour: a.colour,
  cardImage: a.image,
  tags: a.tags,
  variantGroup: a.variantGroup,
  style: a.style,
  phase: a.phase,
  lengthOptions: a.lengthOptions,
  tagline: `${a.phase} · ${a.style} · ${a.colour}`,
  gallery: [a.image],
  description: accDescription,
  features: accFeatures,
  specs: [
    ...accSharedSpecs,
    ...(a.phase === "3 Phase" ? accThreePhaseSpecs : accSinglePhaseSpecs),
    { label: "Length Options", value: a.lengthOptions.join(", ") },
    { label: "Colour", value: a.colour },
  ],
  warranty: "Not specified by manufacturer",
}));

function toCreate(
  p: SeedProduct,
  indexInCategory: number,
): Prisma.ProductCreateManyInput {
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    brand: p.brand,
    colour: p.colour,
    cardImage: p.cardImage,
    tags: p.tags ?? [],
    variantGroup: p.variantGroup ?? null,
    featured: indexInCategory < 3,
    sortOrder: indexInCategory,
    spec: p.spec ?? null,
    connectionType: p.connectionType ?? null,
    cableLength: p.cableLength ?? null,
    powerOutput: p.powerOutput ?? null,
    price: p.price ?? null,
    cableLengthOptions: p.cableLengthOptions ?? [],
    compatibleTariffs: p.compatibleTariffs ?? [],
    style: p.style ?? null,
    phase: p.phase ?? null,
    lengthOptions: p.lengthOptions ?? [],
    tagline: p.tagline ?? null,
    gallery: p.gallery ?? [],
    description: p.description ?? [],
    features: p.features ?? [],
    specs: (p.specs ?? []) as Prisma.InputJsonValue,
    warranty: p.warranty ?? null,
  };
}

export const sampleProducts: Prisma.ProductCreateManyInput[] = [
  ...residential.map((p, i) => toCreate(p, i)),
  ...commercial.map((p, i) => toCreate(p, i)),
  ...accessories.map((p, i) => toCreate(p, i)),
];
