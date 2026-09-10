import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog-dal";

export const metadata: Metadata = { title: "Commercial Chargers | Admin" };

export default async function AdminCommercialPage() {
  const rows = await getAdminProducts("Commercial");
  return <ProductsView category="Commercial" products={rows.map(toAdminRow)} />;
}
