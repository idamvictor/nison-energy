import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessoryProductForm } from "@/components/admin/accessories/accessory-product-form";
import { accessoryProducts } from "@/lib/accessory-products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = accessoryProducts.find((p) => p.id === slug);
  return { title: product ? `${product.name} | Admin` : "Product | Admin" };
}

export default async function EditAccessoryProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = accessoryProducts.find((p) => p.id === slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AccessoryProductForm product={product} />
    </div>
  );
}
