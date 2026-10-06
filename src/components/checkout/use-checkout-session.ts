"use client";

import { useEffect, useRef, useState } from "react";

import { startCheckout } from "@/lib/orders/actions";
import type { CheckoutKind, CheckoutTotals } from "@/lib/orders/types";

export type CheckoutSession = { clientSecret: string; draftId: string; kind: CheckoutKind } & CheckoutTotals;

/**
 * A server-priced Stripe Checkout Session (+ draft) for `orderLinesJson`,
 * opened once `enabled` and reopened — replacing its draft — whenever the
 * lines change. Used by the checkout, the cart and product-page "buy now".
 */
export function useCheckoutSession(
  kind: CheckoutKind,
  orderLinesJson: string,
  enabled: boolean,
  opts?: { keepCart?: boolean },
) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<string | undefined>(undefined);
  const keepCart = opts?.keepCart ?? false;
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await startCheckout(JSON.parse(orderLinesJson), draftRef.current, kind, { keepCart });
      if (result.ok) draftRef.current = result.draftId;
      if (cancelled) return;
      if (result.ok) {
        setSession({ ...result, kind });
        setError(null);
      } else {
        setSession(null);
        setError(result.error);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderLinesJson, enabled, kind, keepCart]);
  return { session: enabled ? session : null, error: enabled ? error : null };
}
