// Residential charger view type. Persisted shape is `Product` in
// prisma/schema.prisma; src/lib/catalog-dal.ts maps a row to this.
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
  warranty?: string;
  active?: boolean;
  featured?: boolean;
};
