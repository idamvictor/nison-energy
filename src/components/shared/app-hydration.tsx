"use client";

import { StoreHydration } from "@/components/shared/store-hydration";
import { useWishlist } from "@/lib/wishlist/store";
import { useCart } from "@/lib/cart/store";
import { useCheckoutForm } from "@/lib/checkout/form-store";

export function AppHydration() {
  return (
    <>
      <StoreHydration
        storageKey="ocunio-wishlist"
        rehydrate={() => useWishlist.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="ocunio-cart"
        rehydrate={() => useCart.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="ocunio-checkout-form"
        rehydrate={() => useCheckoutForm.persist.rehydrate()}
      />
    </>
  );
}
