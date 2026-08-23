"use client";

import { useEffect } from "react";

import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistHydration() {
  useEffect(() => {
    useWishlist.persist.rehydrate();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "nison-wishlist") useWishlist.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
