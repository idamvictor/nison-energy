import type { Metadata } from "next";
import { Package } from "lucide-react";

import { CategoryProductsPage } from "@/components/admin/category-products-page";

export const metadata: Metadata = { title: "Commercial Chargers | Admin" };

export default function AdminCommercialPage() {
  return (
    <CategoryProductsPage
      category="commercial"
      title="Commercial Chargers"
      description="workplace chargers"
      icon={<Package className="size-5" />}
      tone="accent"
    />
  );
}
