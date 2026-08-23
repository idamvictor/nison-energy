"use client";

import { useEffect } from "react";

// Generic bootstrap for any zustand `persist` store created with
// skipHydration: true — calls rehydrate() once after mount (avoiding the
// server/client mismatch a synchronous localStorage read would cause) and
// again on cross-tab storage changes. Used once per store in the root
// layout, e.g. <StoreHydration rehydrate={() => useCart.persist.rehydrate()} storageKey="nison-cart" />.
export function StoreHydration({
  rehydrate,
  storageKey,
}: {
  rehydrate: () => void;
  storageKey: string;
}) {
  useEffect(() => {
    rehydrate();

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [rehydrate, storageKey]);

  return null;
}
