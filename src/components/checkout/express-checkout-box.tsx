"use client";

import Link from "next/link";

import { ExpressWallets, WalletButtonsWaiting, WalletSkeleton } from "@/components/checkout/express-wallets";
import { StripeCheckoutProvider, stripeConfigured } from "@/components/checkout/stripe-payment";
import { useCheckoutSession } from "@/components/checkout/use-checkout-session";
import type { OrderLineInput } from "@/lib/orders/types";

/**
 * Apple Pay / Google Pay / PayPal for a given set of lines — used on the cart
 * and as "buy now" on product pages. Opens its own server-priced wallet
 * session; the wallet supplies name, address and payment. While
 * `disabledReason` is set (e.g. no installation chosen) the buttons show but
 * explain what's missing. Hidden for quote-only items (no online price).
 */
export function ExpressCheckoutBox({
  lines,
  label,
  disabledReason,
  keepCart = false,
}: {
  lines: OrderLineInput[];
  /** Divider text above the buttons, e.g. "or pay with". */
  label: string;
  disabledReason?: string | null;
  /** Product-page buy-now: don't empty the basket after paying. */
  keepCart?: boolean;
}) {
  const payable = lines.length > 0 && lines.every((line) => line.unitPrice != null);
  const enabled = payable && stripeConfigured && !disabledReason;
  const { session, error } = useCheckoutSession("wallet", JSON.stringify(lines), enabled, { keepCart });

  if (!payable || !stripeConfigured) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {label}
        <span className="h-px flex-1 bg-border" />
      </div>
      {disabledReason ? (
        <WalletButtonsWaiting reason={disabledReason} />
      ) : error ? (
        <p className="text-center text-xs text-destructive">{error}</p>
      ) : session ? (
        <StripeCheckoutProvider key={session.clientSecret} clientSecret={session.clientSecret}>
          <ExpressWallets />
        </StripeCheckoutProvider>
      ) : (
        <WalletSkeleton />
      )}
      <p className="text-center text-xs text-muted-foreground">
        By paying you agree to our{" "}
        <Link href="/terms-of-sale" target="_blank" className="font-medium text-primary-ink underline underline-offset-2">
          Terms and Conditions of Sale
        </Link>
        .
      </p>
    </div>
  );
}
