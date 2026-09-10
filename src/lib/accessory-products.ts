// Accessory view type. Persisted shape is `Product` (category Accessory) in
// prisma/schema.prisma; src/lib/catalog-dal.ts maps a row to this.
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
  active?: boolean;
  featured?: boolean;
};
