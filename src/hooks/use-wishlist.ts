"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nison-wishlist";
const CHANGE_EVENT = "nison-wishlist-change";

export type WishlistCategory = "residential" | "commercial" | "accessories";
export type WishlistItem = { id: string; category: WishlistCategory };

function readWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage unavailable — wishlist just won't persist this session
  }
}

// Every product card mounts its own instance of this hook, so a toggle in
// one card needs to resync every other instance in the tab (e.g. unhearting
// a product on the wishlist page should drop it from view immediately,
// not just on next reload) — a same-tab custom event plus the native
// cross-tab "storage" event both trigger every instance to re-read.
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readWishlist());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const toggle = useCallback((id: string, category: WishlistCategory) => {
    const current = readWishlist();
    const next = current.some((item) => item.id === id)
      ? current.filter((item) => item.id !== id)
      : [...current, { id, category }];
    writeWishlist(next);
    setItems(next);
  }, []);

  return { items, isWishlisted, toggle };
}
