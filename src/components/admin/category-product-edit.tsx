import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getCatalogItem, type CatalogCategory } from "@/lib/admin-catalog";

export function CategoryProductEdit({
  category,
  slug,
}: {
  category: CatalogCategory;
  slug: string;
}) {
  const item = getCatalogItem(category, slug);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category={category} item={item} />
    </div>
  );
}
