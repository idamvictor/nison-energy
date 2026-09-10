import { create } from "zustand";
import { persist } from "zustand/middleware";

import { cartItemHref, type CartCategory } from "@/lib/catalog/types";

export type { CartCategory };
export type CartItemOptions = {
  cableLength?: string;
  installation?: "standard" | "none";
};

// The catalog now lives in Postgres, so the cart snapshots the fields it needs
// when an item is added — the same pattern as OrderItem. The cart then renders
// without ever touching the DB, and keeps showing what you added even if the
// product is later edited or removed.
export type CartItem = {
  id: string;
  category: CartCategory;
  quantity: number;
  options?: CartItemOptions;
  name: string;
  brand: string;
  image: string;
  price: number | null;
};

export type CartSnapshot = Omit<CartItem, "quantity" | "options">;

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    snapshot: CartSnapshot,
    quantity?: number,
    options?: CartItemOptions
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

// Renders the cable length / installation type carried over from the
// product page as a short line under the product name, wherever cart lines
// are shown (mini-cart, /cart, checkout order summary).
export function formatCartOptions(options?: CartItemOptions) {
  if (!options) return null;
  const parts: string[] = [];
  if (options.cableLength) parts.push(`${options.cableLength} cable`);
  if (options.installation) {
    parts.push(
      options.installation === "standard"
        ? "Standard installation"
        : "No installation"
    );
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (snapshot, quantity = 1, options) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === snapshot.id);
          const items = existing
            ? state.items.map((item) =>
                item.id === snapshot.id
                  ? {
                      ...item,
                      ...snapshot,
                      quantity: item.quantity + quantity,
                      options: options ?? item.options,
                    }
                  : item
              )
            : [...state.items, { ...snapshot, quantity, options }];
          return { items, isOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, quantity } : item
                ),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      // v2: cart items now carry a name/brand/image/price snapshot. Pre-v2
      // carts lack those fields, so drop them.
      name: "ocunio-cart",
      version: 2,
      migrate: () => ({ items: [] }) as Partial<CartState>,
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export type ResolvedCartLine = {
  id: string;
  category: CartCategory;
  quantity: number;
  options?: CartItemOptions;
  name: string;
  brand: string;
  image: string;
  price: number | null;
  href: string;
};

export function resolveCartItem(item: CartItem): ResolvedCartLine {
  return {
    id: item.id,
    category: item.category,
    quantity: item.quantity,
    options: item.options,
    name: item.name,
    brand: item.brand,
    image: item.image,
    price: item.price,
    href: cartItemHref(item.category, item.id),
  };
}
