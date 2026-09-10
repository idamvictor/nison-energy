// Detail-page content view type. Stored on the `Product` row
// (tagline/gallery/description/features/specs/warranty); src/lib/catalog-dal.ts
// maps a row to this.
export type Spec = { label: string; value: string };

export type ProductDetail = {
  tagline: string;
  gallery: string[];
  description: string[];
  features: string[];
  specs: Spec[];
  warranty: string;
};
