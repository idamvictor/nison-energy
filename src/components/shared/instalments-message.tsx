"use client";

import { useState } from "react";
import { Elements, PaymentMethodMessagingElement } from "@stripe/react-stripe-js";

import { stripePromise } from "@/components/checkout/stripe-promise";
import { cn } from "@/lib/utils";

// Klarna's own "3 payments of £X at 0% interest" line, via Stripe's Payment
// Method Messaging Element. Klarna/Stripe write the wording (it's a credit
// promotion, so we don't hand-write it) and decide eligibility per amount —
// e.g. UK Pay in 3 covers £1–£2,000. PayPal isn't supported by this element.

// Klarna UK "Pay in 3" covers £1–£2,000. Outside that Stripe has no message
// to show and raises a load error, so don't ask for one.
const MIN_PENCE = 100;
const MAX_PENCE = 200_000;

const appearance = {
  variables: {
    colorText: "#000000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizeBase: "14px",
  },
};

export function InstalmentsMessage({ amount, className }: { amount: number | null | undefined; className?: string }) {
  const pence = Math.round((amount ?? 0) * 100);
  // Stripe couldn't load a message for this amount (network, blocker, Klarna
  // unavailable): hide quietly. Keyed by amount so a new total tries again.
  const [failedFor, setFailedFor] = useState<number | null>(null);
  if (!stripePromise || pence < MIN_PENCE || pence > MAX_PENCE || failedFor === pence) return null;

  return (
    <div className={cn("min-h-0", className)}>
      <Elements stripe={stripePromise} options={{ appearance }}>
        <PaymentMethodMessagingElement
          options={{
            amount: pence,
            currency: "GBP",
            countryCode: "GB",
            paymentMethodTypes: ["klarna"],
          }}
          // react-stripe-js wires onLoadError to the element's "loaderror"
          // event for every Element, but omits it from this one's types.
          {...({ onLoadError: () => setFailedFor(pence) } as object)}
        />
      </Elements>
    </div>
  );
}
