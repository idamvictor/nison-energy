"use client";

import { Elements, PaymentMethodMessagingElement } from "@stripe/react-stripe-js";

import { stripePromise } from "@/components/checkout/stripe-promise";
import { cn } from "@/lib/utils";

// Klarna's own "3 payments of £X at 0% interest" line, via Stripe's Payment
// Method Messaging Element. Klarna/Stripe write the wording (it's a credit
// promotion, so we don't hand-write it) and decide eligibility per amount —
// e.g. UK Pay in 3 covers £1–£2,000. PayPal isn't supported by this element.

const appearance = {
  variables: {
    colorText: "#000000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizeBase: "14px",
  },
};

export function InstalmentsMessage({ amount, className }: { amount: number | null | undefined; className?: string }) {
  const pence = Math.round((amount ?? 0) * 100);
  if (!stripePromise || pence <= 0) return null;

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
        />
      </Elements>
    </div>
  );
}
