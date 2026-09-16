import type { Metadata } from "next";

import { ChargersView, type ChargerAdminRow } from "@/components/admin/catalog/chargers-view";
import { getAdminProducts, toAdminRow } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Chargers | Admin" };

export default async function AdminChargersPage() {
  const [residential, commercial] = await Promise.all([
    getAdminProducts("Residential"),
    getAdminProducts("Commercial"),
  ]);

  const products: ChargerAdminRow[] = [
    ...residential.map((r) => ({ ...toAdminRow(r), category: "Residential" as const })),
    ...commercial.map((r) => ({ ...toAdminRow(r), category: "Commercial" as const })),
  ];

  return <ChargersView products={products} />;
}
