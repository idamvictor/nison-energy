import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/catalog/product-form";
import { getProductRow, toSerializableRow } from "@/lib/catalog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductRow(slug);
  return { title: row ? `${row.name} | Admin` : "Product | Admin" };
}

export default async function EditSolarProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductRow(slug);
  if (!row || row.category !== "Solar") notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="Solar" row={toSerializableRow(row)} />
    </div>
  );
}
