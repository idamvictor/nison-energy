import type { Metadata } from "next";

import { ResidentialProductForm } from "@/components/admin/residential/residential-product-form";

export const metadata: Metadata = { title: "Add residential charger | Admin" };

export default function NewResidentialProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ResidentialProductForm />
    </div>
  );
}
