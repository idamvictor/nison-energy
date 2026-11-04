import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog/product-form";

export const metadata: Metadata = { title: "Add cable product | Admin" };

export default function NewCablePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="Cable" row={null} />
    </div>
  );
}
