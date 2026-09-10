import type { Metadata } from "next";

import { AccountWishlist } from "@/components/account/account-wishlist";
import {
  getResidentialCatalog,
  getCommercialCatalog,
  getAccessoryCatalog,
} from "@/lib/catalog-dal";

export const metadata: Metadata = { title: "Wishlist" };

export default async function AccountWishlistPage() {
  const [residential, commercial, accessories] = await Promise.all([
    getResidentialCatalog(),
    getCommercialCatalog(),
    getAccessoryCatalog(),
  ]);
  return (
    <AccountWishlist
      residential={residential}
      commercial={commercial}
      accessories={accessories}
    />
  );
}
