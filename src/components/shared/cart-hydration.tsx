"use client";

import { useEffect } from "react";

import { useCart } from "@/hooks/use-cart";

export function CartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "nison-cart") useCart.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
