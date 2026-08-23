import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistCategory = "residential" | "commercial" | "accessories";
export type WishlistItem = { id: string; category: WishlistCategory };

type WishlistState = {
  items: WishlistItem[];
  isWishlisted: (id: string) => boolean;
  toggle: (id: string, category: WishlistCategory) => void;
};

// A shared store, not per-component state — every product card and the
// account wishlist page all read/write the same `items` array, so toggling
// a heart on one card is instantly reflected everywhere else. skipHydration
// defers reading localStorage until WishlistHydration's useEffect runs
// after mount, avoiding a server/client mismatch on first render (the same
// hydration-safe pattern already used for Reveal, AnimatedNumber and
// useIsMobile in this codebase).
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isWishlisted: (id) => get().items.some((item) => item.id === id),
      toggle: (id, category) =>
        set((state) => ({
          items: state.items.some((item) => item.id === id)
            ? state.items.filter((item) => item.id !== id)
            : [...state.items, { id, category }],
        })),
    }),
    {
      name: "nison-wishlist",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
