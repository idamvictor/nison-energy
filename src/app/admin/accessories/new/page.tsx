import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog/product-form";

export const metadata: Metadata = { title: "Add accessory | Admin" };

export default function NewAccessoryProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="Accessory" row={null} />
    </div>
  );
}
