export type Product = {
  id: string;
  name: string;
  spec: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  image: string;
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

export const products: Product[] = [
  {
    id: "easee-one",
    name: "Easee One 7.4kW Smart Charger",
    spec: "7.4kW · Type 2 · Untethered · WiFi & 4G",
    price: 799,
    compareAtPrice: 899,
    rating: 4.8,
    reviewCount: 62,
    tags: ["Nison recommends", "Save 11%"],
    image: `${IMG}/2025/05/easee-one-ev-charger-8.jpg`,
  },
  {
    id: "hypervolt-white",
    name: "Hypervolt Home Pro 3",
    spec: "7.4kW · Type 2 tethered · 5m cable · White",
    price: 749,
    rating: 4.7,
    reviewCount: 118,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/05/hypervolt-7kw-5m-ev-charger-white.webp`,
  },
  {
    id: "hypervolt-grey",
    name: "Hypervolt Home Pro 3",
    spec: "7.4kW · Type 2 tethered · 5m cable · Space Grey",
    price: 749,
    compareAtPrice: 829,
    rating: 4.7,
    reviewCount: 118,
    tags: ["Save 10%"],
    image: `${IMG}/2025/05/hypervolt-7kw-ev-charger-space-grey-3.webp`,
  },
  {
    id: "indra-lux-black",
    name: "Indra Smart LUX",
    spec: "7.4kW · Type 2 tethered · 6m cable · Black",
    price: 899,
    rating: 4.9,
    reviewCount: 34,
    tags: ["Nison recommends", "5 year guarantee"],
    image: `${IMG}/2025/05/indra-smart-lux-ev-charger-black.webp`,
  },
  {
    id: "indra-lux-white",
    name: "Indra Smart LUX",
    spec: "7.4kW · Type 2 tethered · 6m cable · White",
    price: 899,
    rating: 4.9,
    reviewCount: 34,
    tags: ["5 year guarantee"],
    image: `${IMG}/2025/08/indra-smart-lux-white-4.webp`,
  },
  {
    id: "indra-pro-black",
    name: "Indra Pro Untethered",
    spec: "7.4kW · Type 2 socket · Black · App control",
    price: 649,
    compareAtPrice: 729,
    rating: 4.6,
    reviewCount: 21,
    tags: ["Save 11%"],
    image: `${IMG}/2025/08/Indra-black-Front-view-scaled.jpg`,
  },
  {
    id: "ohme-home-pro",
    name: "Ohme Home Pro",
    spec: "7.4kW · Type 2 tethered · Smart tariff ready",
    price: 649,
    rating: 4.8,
    reviewCount: 203,
    tags: ["Nison recommends", "Free UK delivery"],
    image: `${IMG}/2025/05/Ohme-home_pro_1.png`,
  },
  {
    id: "ohme-epod",
    name: "Ohme ePod",
    spec: "7.4kW · Compact wall unit · Type 2",
    price: 549,
    rating: 4.5,
    reviewCount: 87,
    tags: ["Free UK delivery"],
    image: `${IMG}/2025/05/Ohme-epod.jpg`,
  },
];
