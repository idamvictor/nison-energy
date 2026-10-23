import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog/product-form";

export const metadata: Metadata = { title: "Add circuit protector | Admin" };

export default function NewCircuitProtectorPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm category="CircuitProtection" row={null} />
    </div>
  );
}
