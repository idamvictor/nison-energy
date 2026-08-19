export type CommercialProduct = {
  id: string;
  name: string;
  brand: string;
  spec: string;
  connectionType: "Tethered" | "Untethered";
  cableLength?: string;
  colour: string;
  powerOutput: string;
  variantGroup?: string;
  price: number;
  tags: string[];
  image: string;
};

const IMG = "https://ocunioenergy.com/wp-content/uploads";

export const commercialProducts: CommercialProduct[] = [
  {
    id: "easee-max-charge",
    name: "Easee Max Charge Multiphase EV Charger",
    brand: "Easee",
    spec: "1.4–22kW · Type 2 socket · Untethered · 4G/WiFi/RFID",
    connectionType: "Untethered",
    colour: "Anthracite",
    powerOutput: "1.4–22kW",
    price: 1634,
    tags: ["Nison recommends"],
    image: `${IMG}/2025/05/easee-charge-max-front-use-this-photo.webp`,
  },
  {
    id: "vchrgd-twentytwo",
    name: "VCHRGD TwentyTwo Dual 22kW EV Charger",
    brand: "VCHRGD",
    spec: "2×22kW · Dual Type 2 sockets · Untethered · OCPP 1.6J",
    connectionType: "Untethered",
    colour: "Black",
    powerOutput: "2×22kW",
    price: 2250,
    tags: ["Dual outlet"],
    image: `${IMG}/2025/05/3.png`,
  },
  {
    id: "zaptec-pro-mid",
    name: "Zaptec Pro MID EV Charger",
    brand: "Zaptec",
    spec: "7–22kW · Type 2 socket · Untethered · MID-certified meter",
    connectionType: "Untethered",
    colour: "Anthracite Grey",
    powerOutput: "7–22kW",
    price: 1547,
    tags: ["5 year warranty"],
    image: `${IMG}/2025/05/Zaptec-Pro.webp`,
  },
  {
    id: "zappi-tethered-black",
    name: "Zappi 22kW Multiphase",
    brand: "myenergi",
    spec: "22kW · Type 2 tethered · 10m cable · Black",
    connectionType: "Tethered",
    cableLength: "10m",
    colour: "Black",
    powerOutput: "22kW",
    variantGroup: "zappi-22kw",
    price: 1296,
    tags: ["Nison recommends", "Solar compatible"],
    image: `${IMG}/2025/06/Zappi_myenergi-zappi-22kw-type-2-tethered-ev-charger-black-2.jpg`,
  },
  {
    id: "zappi-tethered-white",
    name: "Zappi 22kW Multiphase",
    brand: "myenergi",
    spec: "22kW · Type 2 tethered · 10m cable · White",
    connectionType: "Tethered",
    cableLength: "10m",
    colour: "White",
    powerOutput: "22kW",
    variantGroup: "zappi-22kw",
    price: 1296,
    tags: ["Solar compatible"],
    image: `${IMG}/2025/06/Zappi-22kW-3-tethered-Phase-Electric-Car-Charger-for-Home-Side-Angle-White.jpg`,
  },
  {
    id: "zappi-untethered-black",
    name: "Zappi 22kW Multiphase Untethered",
    brand: "myenergi",
    spec: "22kW · Type 2 socket · Untethered · Black",
    connectionType: "Untethered",
    colour: "Black",
    powerOutput: "22kW",
    variantGroup: "zappi-22kw",
    price: 1296,
    tags: ["Solar compatible"],
    image: `${IMG}/2025/05/zappi-22kw-type-2-untethered-ev-charger-black-2.webp`,
  },
  {
    id: "zappi-untethered-white",
    name: "Zappi 22kW Multiphase Untethered",
    brand: "myenergi",
    spec: "22kW · Type 2 socket · Untethered · White",
    connectionType: "Untethered",
    colour: "White",
    powerOutput: "22kW",
    variantGroup: "zappi-22kw",
    price: 1296,
    tags: ["Solar compatible"],
    image: `${IMG}/2025/05/zappi-22kw-type-2-untethered-ev-charger-white.webp`,
  },
];
