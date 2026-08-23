import type { Metadata } from "next";
import { Cable } from "lucide-react";

import { CategoryProductsPage } from "@/components/admin/category-products-page";

export const metadata: Metadata = { title: "Accessories | Admin" };

export default function AdminAccessoriesPage() {
  return (
    <CategoryProductsPage
      category="accessories"
      title="Accessories"
      description="charging cables"
      icon={<Cable className="size-5" />}
      tone="success"
    />
  );
}
