"use client";

import { StoreHydration } from "@/components/shared/store-hydration";
import { useWishlist } from "@/lib/wishlist/store";
import { useCart } from "@/lib/cart/store";
import { useGrantApplication } from "@/lib/grant-guide/store";
import { useNotifications } from "@/lib/notifications/store";
import { useBlogPosts } from "@/lib/blog/store";

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
        storageKey="ocunio-grant-application"
        rehydrate={() => useGrantApplication.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="ocunio-notifications"
        rehydrate={() => useNotifications.persist.rehydrate()}
      />
      <StoreHydration
        storageKey="ocunio-blog-posts"
        rehydrate={() => useBlogPosts.persist.rehydrate()}
      />
    </>
  );
}
