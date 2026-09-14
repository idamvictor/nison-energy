"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";

/** Empties the cart once a Stripe payment has actually succeeded — not before
 * the redirect to Stripe, so a cancelled/abandoned payment leaves the cart intact. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
