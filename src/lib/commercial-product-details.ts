import type { ProductDetail } from "@/lib/product-details";

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const standardInstall = [
  "EV charger",
  "10m cable from charger to fuse box",
  "NICEIC qualified installer",
  "OZEV Workplace Charging Scheme grant application support, if eligible",
  "DNO application to the power grid supplier",
  "System commissioning",
];

const commercialDetailsByModel: Record<string, ProductDetail> = {
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
    gallery: [`${IMG}/2025/06/Zappi_myenergi-zappi-22kw-type-2-tethered-ev-charger-black-2.jpg`],
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

const modelByProductId: Record<string, string> = {
  "easee-max-charge": "easee-max-charge",
  "vchrgd-twentytwo": "vchrgd-twentytwo",
  "zaptec-pro-mid": "zaptec-pro-mid",
  "zappi-tethered-black": "zappi-22kw",
  "zappi-tethered-white": "zappi-22kw",
  "zappi-untethered-black": "zappi-22kw",
  "zappi-untethered-white": "zappi-22kw",
};

export const commercialProductDetails: Record<string, ProductDetail> =
  Object.fromEntries(
    Object.entries(modelByProductId).map(([productId, model]) => [
      productId,
      commercialDetailsByModel[model],
    ])
  );

export const commercialStandardInstallation = standardInstall;
