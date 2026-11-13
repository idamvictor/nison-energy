import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog/product-form";

export const metadata: Metadata = { title: "Add cover | Admin" };

export default function NewCoverPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="Cover" row={null} />
    </div>
  );
}
