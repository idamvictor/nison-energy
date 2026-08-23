import type { Metadata } from "next";

import { CommercialProductsPage } from "@/components/admin/commercial/commercial-products-page";

export const metadata: Metadata = { title: "Commercial Chargers | Admin" };

export default function AdminCommercialPage() {
  return <CommercialProductsPage />;
}
