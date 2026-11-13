import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Mounts & Posts | Admin" };

export default async function AdminMountPage() {
  const rows = await getAdminProducts("Mount");
  return <ProductsView category="Mount" products={rows.map(toAdminRow)} />;
}
