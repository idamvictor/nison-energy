"use client";

import { StoreHydration } from "@/components/shared/store-hydration";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useGrantApplication } from "@/hooks/use-grant-application";

export function AppHydration() {
  return (
    <>
      <StoreHydration
        storageKey="nison-wishlist"
        rehydrate={() => useWishlist.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="nison-cart"
        rehydrate={() => useCart.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="nison-auth"
        rehydrate={() => useAuth.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="nison-grant-application"
        rehydrate={() => useGrantApplication.persist.rehydrate()}
      />
    </>
  );
}
