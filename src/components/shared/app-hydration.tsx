"use client";

import { StoreHydration } from "@/components/shared/store-hydration";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useGrantApplication } from "@/hooks/use-grant-application";
import { useNotifications } from "@/hooks/use-notifications";
import { useBlogPosts } from "@/hooks/use-blog-posts";

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
        storageKey="ocunio-auth"
        rehydrate={() => useAuth.persist.rehydrate()}
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
