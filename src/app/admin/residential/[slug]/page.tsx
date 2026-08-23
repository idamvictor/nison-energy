import type { Metadata } from "next";

import { CategoryProductEdit } from "@/components/admin/category-product-edit";
import { getCatalogItem } from "@/lib/admin-catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getCatalogItem("residential", slug);
  return { title: item ? `${item.name} | Admin` : "Product | Admin" };
}

export default async function EditResidentialProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryProductEdit category="residential" slug={slug} />;
}
