import { products, type Product } from "@/lib/products";
import {
  commercialProducts,
  type CommercialProduct,
} from "@/lib/commercial-products";
import {
  accessoryProducts,
  type AccessoryProduct,
} from "@/lib/accessory-products";
import { productDetails } from "@/lib/product-details";
import { commercialProductDetails } from "@/lib/commercial-product-details";
import { getAccessoryDetail } from "@/lib/accessory-product-details";

export type CatalogCategory = "residential" | "commercial" | "accessories";

export const catalogCategoryLabels: Record<CatalogCategory, string> = {
  residential: "Residential Chargers",
  commercial: "Commercial Chargers",
  accessories: "Accessories",
};

export const catalogCategoryHrefs: Record<CatalogCategory, string> = {
  residential: "/home-charging",
  commercial: "/workplace-charging",
  accessories: "/accessories",
};

export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  name: string;
  brand: string;
  image: string;
  colour: string;
  price: number | null;
  tags: string[];
  spec: string;
  raw: Product | CommercialProduct | AccessoryProduct;
};

function accessorySpec(product: AccessoryProduct): string {
  return `${product.phase} · ${product.style} · ${product.lengthOptions.join("/")}`;
}

export function getCatalogItems(): CatalogItem[] {
  return [
    ...products.map((product): CatalogItem => ({
      id: product.id,
      category: "residential",
      name: product.name,
      brand: product.brand,
      image: product.image,
      colour: product.colour,
      price: product.price,
      tags: product.tags,
      spec: product.spec,
      raw: product,
    })),
    ...commercialProducts.map((product): CatalogItem => ({
      id: product.id,
      category: "commercial",
      name: product.name,
      brand: product.brand,
      image: product.image,
      colour: product.colour,
      price: product.price,
      tags: product.tags,
      spec: product.spec,
      raw: product,
    })),
    ...accessoryProducts.map((product): CatalogItem => ({
      id: product.id,
      category: "accessories",
      name: product.name,
      brand: product.brand,
      image: product.image,
      colour: product.colour,
      price: null,
      tags: product.tags,
      spec: accessorySpec(product),
      raw: product,
    })),
  ];
}

export function getCatalogItem(
  category: CatalogCategory,
  id: string
): CatalogItem | undefined {
  return getCatalogItems().find(
    (item) => item.category === category && item.id === id
  );
}

// Product cards only carry a single `image`, but the detail pages already
// have full multi-image galleries crawled from the real site — reuse those
// as the starting point for the admin's multi-image editor.
export function getCatalogItemGallery(item: CatalogItem): string[] {
  const gallery =
    item.category === "residential"
      ? productDetails[item.id]?.gallery
      : item.category === "commercial"
        ? commercialProductDetails[item.id]?.gallery
        : getAccessoryDetail(item.id)?.gallery;

  return gallery && gallery.length > 0 ? gallery : [item.image];
}
