import type { Metadata } from "next";

import { AccessoryProductForm } from "@/components/admin/accessories/accessory-product-form";

export const metadata: Metadata = { title: "Add accessory | Admin" };

export default function NewAccessoryProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AccessoryProductForm />
    </div>
  );
}
