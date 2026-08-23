import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add residential charger | Admin" };

export default function NewResidentialProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="residential" />
    </div>
  );
}
