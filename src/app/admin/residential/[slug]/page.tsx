import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResidentialProductForm } from "@/components/admin/residential/residential-product-form";
import { products } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  return { title: product ? `${product.name} | Admin` : "Product | Admin" };
}

export default async function EditResidentialProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <ResidentialProductForm product={product} />
    </div>
  );
}
