"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";
import { useCheckoutForm } from "@/lib/checkout/form-store";

/** Empties the cart once a Stripe payment has actually succeeded — not before
 * the redirect to Stripe, so a cancelled/abandoned payment leaves the cart intact. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  const clearForm = useCheckoutForm((s) => s.clear);

  useEffect(() => {
    clear();
    clearForm();
  }, [clear, clearForm]);

  return null;
}
