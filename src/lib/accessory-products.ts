export type AccessoryProduct = {
  id: string;
  name: string;
  brand: string;
  style: "Coiled" | "Straight";
  colour: string;
  phase: "Single Phase" | "3 Phase";
  lengthOptions: string[];
  variantGroup: string;
  tags: string[];
  image: string;
};

const IMG = "https://ocunioenergy.com/wp-content/uploads/2025/05";

const images = {
  greyCoiled: `${IMG}/ZEV_Grey-Coil-min-scaled.png`,
  greyStraight: `${IMG}/ZEV_Grey_Straight-2-min-scaled.png`,
  greenCoiled: `${IMG}/ZEV_Green-Coil-min-1-scaled.png`,
  greenStraight: `${IMG}/ZEV_Green_Straight_Cap-On-1-min-scaled.png`,
};

export const accessoryProducts: AccessoryProduct[] = [
  {
    id: "zev-3phase-coiled-grey",
    name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Coiled",
    brand: "ZEV",
    style: "Coiled",
    colour: "Discreet Grey",
    phase: "3 Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-3phase",
    tags: ["Ocunio recommends"],
    image: images.greyCoiled,
  },
  {
    id: "zev-3phase-coiled-green",
    name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Coiled",
    brand: "ZEV",
    style: "Coiled",
    colour: "Hi-vis Lime Green",
    phase: "3 Phase",
    lengthOptions: ["5m", "7.5m"],
    variantGroup: "zev-3phase",
    tags: [],
    image: images.greenCoiled,
  },
  {
    id: "zev-3phase-straight-grey",
    name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Straight",
    brand: "ZEV",
    style: "Straight",
    colour: "Discreet Grey",
    phase: "3 Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-3phase",
    tags: [],
    image: images.greyStraight,
  },
  {
    id: "zev-3phase-straight-green",
    name: "ZEV Type2-Type2 32A 3 Phase Charging Cable, Straight",
    brand: "ZEV",
    style: "Straight",
    colour: "Hi-vis Lime Green",
    phase: "3 Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-3phase",
    tags: [],
    image: images.greenStraight,
  },
  {
    id: "zev-single-coiled-grey",
    name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Coiled",
    brand: "ZEV",
    style: "Coiled",
    colour: "Discreet Grey",
    phase: "Single Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-single",
    tags: ["Ocunio recommends"],
    image: images.greyCoiled,
  },
  {
    id: "zev-single-coiled-green",
    name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Coiled",
    brand: "ZEV",
    style: "Coiled",
    colour: "Hi-vis Lime Green",
    phase: "Single Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-single",
    tags: [],
    image: images.greenCoiled,
  },
  {
    id: "zev-single-straight-grey",
    name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Straight",
    brand: "ZEV",
    style: "Straight",
    colour: "Discreet Grey",
    phase: "Single Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-single",
    tags: [],
    image: images.greyStraight,
  },
  {
    id: "zev-single-straight-green",
    name: "ZEV Type2-Type2 32A Single Phase Charging Cable, Straight",
    brand: "ZEV",
    style: "Straight",
    colour: "Hi-vis Lime Green",
    phase: "Single Phase",
    lengthOptions: ["5m", "10m"],
    variantGroup: "zev-single",
    tags: [],
    image: images.greenStraight,
  },
];
