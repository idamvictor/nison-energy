import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add accessory | Admin" };

export default function NewAccessoryProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="accessories" />
    </div>
  );
}
