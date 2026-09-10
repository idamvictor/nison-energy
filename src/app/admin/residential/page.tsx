import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog-dal";

export const metadata: Metadata = { title: "Residential Chargers | Admin" };

export default async function AdminResidentialPage() {
  const rows = await getAdminProducts("Residential");
  return (
    <ProductsView category="Residential" products={rows.map(toAdminRow)} />
  );
}
