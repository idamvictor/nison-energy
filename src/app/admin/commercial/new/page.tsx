import type { Metadata } from "next";

import { CommercialProductForm } from "@/components/admin/commercial/commercial-product-form";

export const metadata: Metadata = { title: "Add commercial charger | Admin" };

export default function NewCommercialProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <CommercialProductForm />
    </div>
  );
}
