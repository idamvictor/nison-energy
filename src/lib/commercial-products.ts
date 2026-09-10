// Commercial charger view type. Persisted shape is `Product` (category
// Commercial) in prisma/schema.prisma; src/lib/catalog-dal.ts maps to this.
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
  warranty?: string;
  active?: boolean;
  featured?: boolean;
};
