import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommercialProductForm } from "@/components/admin/commercial/commercial-product-form";
import { commercialProducts } from "@/lib/commercial-products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = commercialProducts.find((p) => p.id === slug);
  return { title: product ? `${product.name} | Admin` : "Product | Admin" };
}

export default async function EditCommercialProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = commercialProducts.find((p) => p.id === slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <CommercialProductForm product={product} />
    </div>
  );
}
