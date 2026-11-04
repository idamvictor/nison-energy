import type { Metadata } from "next";

import { AccountWishlist } from "@/components/account/account-wishlist";
import {
  getResidentialCatalog,
  getCommercialCatalog,
  getAccessoryCatalog,
  getSolarCatalog,
  getCircuitProtectorCatalog,
  getCableCatalog,
} from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Wishlist" };

export default async function AccountWishlistPage() {
  const [residential, commercial, accessories, solar, circuitProtectors, cables] = await Promise.all([
    getResidentialCatalog(),
    getCommercialCatalog(),
    getAccessoryCatalog(),
    getSolarCatalog(),
    getCircuitProtectorCatalog(),
    getCableCatalog(),
  ]);
  return (
    <AccountWishlist
      residential={residential}
      commercial={commercial}
      accessories={accessories}
      solar={solar}
      circuitProtectors={circuitProtectors}
      cables={cables}
    />
  );
}
