"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/cart/store";
import { useCheckoutForm } from "@/lib/checkout/form-store";
import { clearCheckoutSessions } from "@/components/checkout/use-checkout-session";

/** Empties the cart once a Stripe payment has actually succeeded — not before
 * the redirect to Stripe, so a cancelled/abandoned payment leaves the cart intact.
 * A product-page buy-now (`keepCart`) only forgets its own session. */
export function ClearCartOnMount({ keepCart = false }: { keepCart?: boolean }) {
  const clear = useCart((s) => s.clear);
  const clearForm = useCheckoutForm((s) => s.clear);

  useEffect(() => {
    if (keepCart) {
      clearCheckoutSessions("buynow");
      return;
    }
    clear();
    clearForm();
    clearCheckoutSessions("basket");
  }, [clear, clearForm, keepCart]);

  return null;
}
