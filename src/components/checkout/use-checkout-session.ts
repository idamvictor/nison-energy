"use client";

import { useEffect, useRef, useState } from "react";

import { startCheckout } from "@/lib/orders/actions";
import type { CheckoutKind, CheckoutTotals } from "@/lib/orders/types";

export type CheckoutSession = { clientSecret: string; draftId: string; kind: CheckoutKind } & CheckoutTotals;

// ── Reuse cache ── One session per slot ("basket:wallet" is shared by the
// cart and checkout express buttons, "basket:card" is the checkout card form,
// "buynow:wallet" is product pages), kept in this browser while the lines
// are unchanged. Opening a new session for a slot discards the previous
// draft on the server, so every cached session still has its draft.
const STORAGE_KEY = "ocunio-checkout-sessions";
const MAX_AGE_MS = 23 * 60 * 60 * 1000; // Stripe expires sessions after 24h

type CachedSession = CheckoutSession & { linesKey: string; createdAt: number };

function readCache(): Record<string, CachedSession> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, CachedSession>;
  } catch {
    return {};
  }
}

function writeCache(update: (cache: Record<string, CachedSession>) => void) {
  try {
    const cache = readCache();
    update(cache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable (private mode etc.) — sessions just aren't reused.
  }
}

/** Forget cached sessions after a successful payment ("basket" or "buynow"). */
export function clearCheckoutSessions(prefix: "basket" | "buynow") {
  writeCache((cache) => {
    for (const slot of Object.keys(cache)) if (slot.startsWith(`${prefix}:`)) delete cache[slot];
  });
}

/**
 * A server-priced Stripe Checkout Session (+ draft) for `orderLinesJson`.
 * Opened only once `enabled` (callers gate it on the buttons being in view),
 * reused from this browser while the lines are unchanged, and reopened —
 * replacing its draft — when they change.
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
  const slot = `${keepCart ? "buynow" : "basket"}:${kind}`;
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const cached = readCache()[slot];
    const reusable = cached && cached.linesKey === orderLinesJson && Date.now() - cached.createdAt < MAX_AGE_MS;
    // A cached session for other lines is replaced (its draft discarded).
    if (cached && !draftRef.current) draftRef.current = cached.draftId;
    const timer = setTimeout(
      async () => {
        if (reusable) {
          draftRef.current = cached.draftId;
          setSession({
            clientSecret: cached.clientSecret,
            draftId: cached.draftId,
            kind,
            subtotal: cached.subtotal,
            deliveryFee: cached.deliveryFee,
            total: cached.total,
          });
          setError(null);
          return;
        }
        const result = await startCheckout(JSON.parse(orderLinesJson), draftRef.current, kind, { keepCart });
        if (result.ok) {
          draftRef.current = result.draftId;
          writeCache((cache) => {
            cache[slot] = { ...result, kind, linesKey: orderLinesJson, createdAt: Date.now() };
          });
        }
        if (cancelled) return;
        if (result.ok) {
          setSession({ ...result, kind });
          setError(null);
        } else {
          setSession(null);
          setError(result.error);
        }
      },
      reusable ? 0 : 400,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderLinesJson, enabled, kind, keepCart, slot]);
  return { session: enabled ? session : null, error: enabled ? error : null };
}
