import type { Metadata } from "next";

import { AccountWishlist } from "@/components/account/account-wishlist";
import {
  getResidentialCatalog,
  getCommercialCatalog,
  getAccessoryCatalog,
  getSolarCatalog,
  getCircuitProtectorCatalog,
} from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Wishlist" };

export default async function AccountWishlistPage() {
  const [residential, commercial, accessories, solar, circuitProtectors] = await Promise.all([
    getResidentialCatalog(),
    getCommercialCatalog(),
    getAccessoryCatalog(),
    getSolarCatalog(),
    getCircuitProtectorCatalog(),
  ]);
  return (
    <AccountWishlist
      residential={residential}
      commercial={commercial}
      accessories={accessories}
      solar={solar}
      circuitProtectors={circuitProtectors}
    />
  );
}
