import { create } from "zustand";
import { persist } from "zustand/middleware";

import { products } from "@/lib/products";
import { commercialProducts } from "@/lib/commercial-products";
import { accessoryProducts } from "@/lib/accessory-products";

export type CartCategory = "residential" | "commercial" | "accessories";
export type CartItem = { id: string; category: CartCategory; quantity: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (id: string, category: CartCategory, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

// Same shared-store shape as useWishlist — a header badge, a mini-cart
// drawer, the /cart page and /checkout all read this one store, so an
// update from any of them is instantly reflected everywhere else.
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (id, category, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          const items = existing
            ? state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...state.items, { id, category, quantity }];
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
      name: "nison-cart",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export type ResolvedCartLine = {
  id: string;
  category: CartCategory;
  quantity: number;
  name: string;
  brand: string;
  image: string;
  price: number | null;
  href: string;
};

export function resolveCartItem(item: CartItem): ResolvedCartLine | null {
  if (item.category === "residential") {
    const product = products.find((p) => p.id === item.id);
    if (!product) return null;
    return {
      ...item,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      href: `/home-charging/${product.id}`,
    };
  }
  if (item.category === "commercial") {
    const product = commercialProducts.find((p) => p.id === item.id);
    if (!product) return null;
    return {
      ...item,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      href: `/workplace-charging/${product.id}`,
    };
  }
  const product = accessoryProducts.find((p) => p.id === item.id);
  if (!product) return null;
  return {
    ...item,
    name: product.name,
    brand: product.brand,
    image: product.image,
    price: null,
    href: `/accessories/${product.id}`,
  };
}
