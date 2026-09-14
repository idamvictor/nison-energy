import type { ProductCategory } from "@/lib/catalog/types";

export type SearchResult = {
  id: string;
  category: ProductCategory;
  name: string;
  brand: string;
  snippet: string;
  image: string;
  price: number | null;
  tags: string[];
};
