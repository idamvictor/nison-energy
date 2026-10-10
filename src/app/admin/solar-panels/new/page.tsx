import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog/product-form";

export const metadata: Metadata = { title: "Add solar panel kit | Admin" };

export default function NewSolarProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="Solar" row={null} />
    </div>
  );
}
