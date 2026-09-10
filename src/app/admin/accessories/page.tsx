import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Accessories | Admin" };

export default async function AdminAccessoriesPage() {
  const rows = await getAdminProducts("Accessory");
  return <ProductsView category="Accessory" products={rows.map(toAdminRow)} />;
}
