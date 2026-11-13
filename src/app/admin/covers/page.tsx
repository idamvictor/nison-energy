import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Covers | Admin" };

export default async function AdminCoverPage() {
  const rows = await getAdminProducts("Cover");
  return <ProductsView category="Cover" products={rows.map(toAdminRow)} />;
}
