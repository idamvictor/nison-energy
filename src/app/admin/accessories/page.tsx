import type { Metadata } from "next";

import { AccessoryProductsPage } from "@/components/admin/accessories/accessory-products-page";

export const metadata: Metadata = { title: "Accessories | Admin" };

export default function AdminAccessoriesPage() {
  return <AccessoryProductsPage />;
}
