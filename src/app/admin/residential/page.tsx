import type { Metadata } from "next";

import { ResidentialProductsPage } from "@/components/admin/residential/residential-products-page";

export const metadata: Metadata = { title: "Residential Chargers | Admin" };

export default function AdminResidentialPage() {
  return <ResidentialProductsPage />;
}
