export type Product = {
  id: string;
  name: string;
  brand: string;
  spec: string;
  connectionType: "Tethered" | "Untethered";
  cableLength?: string;
  cableLengthOptions?: string[];
  colour: string;
  powerOutput: string;
  variantGroup?: string;
  compatibleTariffs?: string[];
  price: number;
  tags: string[];
  image: string;
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

export const products: Product[] = [
  {
    id: "easee-one",
    name: "Easee One 7.4kW Smart Charger",
    brand: "Easee",
    spec: "7.4kW · Type 2 · Untethered · WiFi & 4G",
    connectionType: "Untethered",
    colour: "Black",
    powerOutput: "7.4kW",
    price: 980,
    tags: ["Nison recommends", "Free UK delivery"],
    image: `${IMG}/2025/05/easee-one-ev-charger-8.jpg`,
  },
  {
    id: "hypervolt-white",
    name: "Hypervolt Home Pro 3",
    brand: "Hypervolt",
    spec: "7.4kW · Type 2 tethered · 5m cable · White",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "7.5m", "10m"],
    colour: "White",
    powerOutput: "7.4kW",
    variantGroup: "hypervolt-home-pro-3",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 1064,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white.webp`,
  },
  {
    id: "hypervolt-grey",
    name: "Hypervolt Home Pro 3",
    brand: "Hypervolt",
    spec: "7.4kW · Type 2 tethered · 5m cable · Space Grey",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "7.5m", "10m"],
    colour: "Space Grey",
    powerOutput: "7.4kW",
    variantGroup: "hypervolt-home-pro-3",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 1079,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/05/hypervolt-7kw-ev-charger-space-grey-3.webp`,
  },
  {
    id: "indra-lux-black",
    name: "Indra Smart LUX",
    brand: "Indra",
    spec: "7.4kW · Type 2 tethered · 6m cable · Black",
    connectionType: "Tethered",
    cableLength: "6m",
    cableLengthOptions: ["6m", "10m"],
    colour: "Black",
    powerOutput: "7.4kW",
    variantGroup: "indra-smart-lux",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 1050,
    tags: ["Nison recommends", "3 year warranty"],
    image: `${IMG}/2025/05/indra-smart-lux-ev-charger-black.webp`,
  },
  {
    id: "indra-lux-white",
    name: "Indra Smart LUX",
    brand: "Indra",
    spec: "7.4kW · Type 2 tethered · 6m cable · White",
    connectionType: "Tethered",
    cableLength: "6m",
    cableLengthOptions: ["6m", "10m"],
    colour: "White",
    powerOutput: "7.4kW",
    variantGroup: "indra-smart-lux",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 1050,
    tags: ["3 year warranty"],
    image: `${IMG}/2025/08/indra-smart-lux-white-4.webp`,
  },
  {
    id: "indra-pro-black",
    name: "Indra Smart Pro Untethered",
    brand: "Indra",
    spec: "7.4kW · Type 2 socket · Black · App control",
    connectionType: "Untethered",
    colour: "Black",
    powerOutput: "7.4kW",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 902,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/08/Indra-black-Front-view-scaled.jpg`,
  },
  {
    id: "ohme-home-pro",
    name: "Ohme Home Pro",
    brand: "Ohme",
    spec: "7.4kW · Type 2 tethered · 5m cable · Smart tariff ready",
    connectionType: "Tethered",
    cableLength: "5m",
    cableLengthOptions: ["5m", "8m"],
    colour: "Black",
    powerOutput: "7.4kW",
    compatibleTariffs: ["Octopus Energy", "OVO Energy"],
    price: 1077,
    tags: ["Nison recommends", "Free UK delivery"],
    image: `${IMG}/2025/05/Ohme-home_pro_1.png`,
  },
  {
    id: "ohme-epod",
    name: "Ohme ePod",
    brand: "Ohme",
    spec: "7.4kW · Compact wall unit · Type 2 · Untethered",
    connectionType: "Untethered",
    colour: "Matte Black",
    powerOutput: "7.4kW",
    price: 957,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/05/Ohme-epod.jpg`,
  },
];
