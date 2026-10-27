import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/catalog/products-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Circuit Protection | Admin" };

export default async function AdminCircuitProtectorsPage() {
  const rows = await getAdminProducts("CircuitProtection");
  return <ProductsView category="CircuitProtection" products={rows.map(toAdminRow)} />;
}
