import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Cables | Admin" };

export default async function AdminCablesPage() {
  const rows = await getAdminProducts("Cable");
  return <ProductsView category="Cable" products={rows.map(toAdminRow)} />;
}
