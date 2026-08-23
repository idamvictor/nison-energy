"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nison-wishlist";

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
  } catch {
    // localStorage unavailable — wishlist just won't persist this session
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(readWishlist());
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const toggle = useCallback((id: string, category: WishlistCategory) => {
    setItems((prev) => {
      const next = prev.some((item) => item.id === id)
        ? prev.filter((item) => item.id !== id)
        : [...prev, { id, category }];
      writeWishlist(next);
      return next;
    });
  }, []);

  return { items, isWishlisted, toggle };
}
