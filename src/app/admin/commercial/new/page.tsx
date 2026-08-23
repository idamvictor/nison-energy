import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add commercial charger | Admin" };

export default function NewCommercialProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="commercial" />
    </div>
  );
}
