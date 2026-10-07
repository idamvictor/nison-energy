"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { startCheckout } from "@/lib/orders/actions";
import type { CheckoutKind, CheckoutTotals } from "@/lib/orders/types";

export type CheckoutSession = { clientSecret: string; draftId: string; kind: CheckoutKind } & CheckoutTotals;

// ── Reuse cache ── One session per slot ("basket:wallet" is shared by the
// cart and checkout express buttons, "basket:card" is the checkout card form,
// "buynow:wallet" is product pages), kept in this browser while the lines
// are unchanged. Opening a new session for a slot discards the previous
// draft on the server, so every cached session still has its draft.
// Entries are tied to the publishable key, so switching Stripe keys (test →
// live, or another account) never reuses a session that account can't see.
const STORAGE_KEY = "ocunio-checkout-sessions";
const MAX_AGE_MS = 23 * 60 * 60 * 1000; // Stripe expires sessions after 24h
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const LIVE_KEY = PUBLISHABLE_KEY.startsWith("pk_live_");

type CachedSession = CheckoutSession & { linesKey: string; createdAt: number; key?: string };

function belongsToThisKey(entry: CachedSession): boolean {
  if (entry.key !== PUBLISHABLE_KEY) return false;
  // Belt and braces: a test session can never work with a live key, or vice versa.
  return entry.clientSecret.startsWith(LIVE_KEY ? "cs_live_" : "cs_test_");
}

function readCache(): Record<string, CachedSession> {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, CachedSession>;
    // Drop anything from another Stripe key (e.g. sessions made while testing).
    const kept = Object.fromEntries(Object.entries(cache).filter(([, entry]) => belongsToThisKey(entry)));
    if (Object.keys(kept).length !== Object.keys(cache).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    }
    return kept;
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
 * replacing its draft — when they change. `discard()` throws the current
 * session away and opens a fresh one (used when Stripe can't load it).
 */
export function useCheckoutSession(
  kind: CheckoutKind,
  orderLinesJson: string,
  enabled: boolean,
  opts?: { keepCart?: boolean; slot?: string },
) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const draftRef = useRef<string | undefined>(undefined);
  const keepCart = opts?.keepCart ?? false;
  const slot = opts?.slot ?? `${keepCart ? "buynow" : "basket"}:${kind}`;

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
            cache[slot] = { ...result, kind, linesKey: orderLinesJson, createdAt: Date.now(), key: PUBLISHABLE_KEY };
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
  }, [orderLinesJson, enabled, kind, keepCart, slot, attempt]);

  /** Stripe couldn't load this session (gone, expired, completed): start a new one. */
  // At most two automatic replacements, so a persistent problem can't loop.
  const discard = useCallback(() => {
    writeCache((cache) => {
      delete cache[slot];
    });
    draftRef.current = undefined;
    setSession(null);
    if (attempt >= 2) {
      setError("We couldn't start secure payment — please refresh the page.");
      return;
    }
    setAttempt((n) => n + 1);
  }, [slot, attempt]);

  return { session: enabled ? session : null, error: enabled ? error : null, discard };
}
