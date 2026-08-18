const IMG = "https://ocunioenergy.com/wp-content/uploads";

export type Spec = { label: string; value: string };

export type ProductDetail = {
  tagline: string;
  gallery: string[];
  description: string[];
  features: string[];
  specs: Spec[];
  warranty: string;
};

const standardInstall = [
  "EV charger",
  "Consumer unit, with optional surge protection",
  "10m cable from charger to fuse box",
  "NICEIC qualified installer",
  "OZEV grant application support, if eligible",
  "DNO application to the power grid supplier",
  "System commissioning",
];

export const productDetails: Record<string, ProductDetail> = {
  "easee-one": {
    tagline: "The future of home EV charging — compact, connected and effortlessly smart.",
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
  "hypervolt-white": {
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
  "hypervolt-grey": {
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
  "indra-lux-black": {
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
  "indra-lux-white": {
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
  "indra-pro-black": {
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
  "ohme-home-pro": {
    tagline: "Smart charging made simple — power your drive the intelligent way.",
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
  "ohme-epod": {
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
};

export const standardInstallation = standardInstall;
