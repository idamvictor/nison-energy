import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Solar Panels | Admin" };

export default async function AdminSolarPanelsPage() {
  const rows = await getAdminProducts("Solar");
  return <ProductsView category="Solar" products={rows.map(toAdminRow)} />;
}
