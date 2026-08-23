import type { Metadata } from "next";
import { Zap } from "lucide-react";

import { CategoryProductsPage } from "@/components/admin/category-products-page";

export const metadata: Metadata = { title: "Residential Chargers | Admin" };

export default function AdminResidentialPage() {
  return (
    <CategoryProductsPage
      category="residential"
      title="Residential Chargers"
      description="home chargers"
      icon={<Zap className="size-5" />}
      tone="primary"
    />
  );
}
