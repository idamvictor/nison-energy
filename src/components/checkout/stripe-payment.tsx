"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeCheckoutContact } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// Module scope so Stripe.js loads once, not on every render.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Stripe's Appearance API takes literal values, not CSS variables — these
// mirror --primary-ink, --foreground, --font-sans and --radius in globals.css.
const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#0280a3",
    colorText: "#000000",
    colorDanger: "#dc2626",
    fontFamily: "Arial, Helvetica, sans-serif",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
};

export type StripePaymentProps = {
  clientSecret: string;
  /** Sent with the payment — the delivery address, or the separate billing one. */
  billingAddress: StripeCheckoutContact;
};

/**
 * Stripe's Payment Element on our own checkout page (Checkout Session with
 * `ui_mode: "elements"`). Confirming redirects to the session's return_url
 * (/checkout/success) once payment — including any 3-D Secure step — succeeds.
 */
export function StripePayment(props: StripePaymentProps) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-destructive">
        Online payment isn&apos;t configured yet — please use WhatsApp to complete your order.
      </p>
    );
  }
  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret: props.clientSecret, elementsOptions: { appearance } }}
    >
      <PaymentForm {...props} />
    </CheckoutElementsProvider>
  );
}

function PaymentForm({ billingAddress }: StripePaymentProps) {
  const state = useCheckoutElements();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stays false until the Payment Element reports every required card field filled.
  const [cardComplete, setCardComplete] = useState(false);

  if (state.type === "error") {
    return <p className="text-sm text-destructive">{state.error.message}</p>;
  }

  const ready = state.type === "success";

  async function pay() {
    if (state.type !== "success") return;
    setError(null);
    setConfirming(true);
    // The session requires a full billing address, and Stripe only accepts one
    // from our own form via updateBillingAddress() — passing it to confirm()
    // isn't enough. Email and phone already come from the session's Customer
    // (upsertStripeCustomer), so confirm() itself takes no billing details.
    const addressResult = await state.checkout.updateBillingAddress(billingAddress);
    if (addressResult.type === "error") {
      setError(addressResult.error.message);
      setConfirming(false);
      return;
    }
    const result = await state.checkout.confirm();
    // On success the browser is already redirecting to /checkout/success.
    if (result.type === "error") {
      setError(result.error.message);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: "tabs",
          // Our form already has the name, email and billing address — Stripe
          // refuses to confirm if the Payment Element could collect them a
          // second time. Only the parts we actually send are "never": phone,
          // line2 and state stay "auto" (UK cards never ask for them), because
          // a "never" field with no value — or every field "never" — is
          // rejected by Stripe at confirm.
          fields: {
            billingDetails: {
              name: "never",
              email: "never",
              address: {
                country: "never",
                postalCode: "never",
                city: "never",
                line1: "never",
                line2: "auto",
                state: "auto",
              },
            },
          },
        }}
        onChange={(event) => setCardComplete(event.complete)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        size="lg"
        variant="cta"
        disabled={!ready || !cardComplete || confirming}
        onClick={pay}
        className="w-full gap-1.5 sm:w-fit"
      >
        <Lock className="size-4" />
        {confirming
          ? "Processing payment…"
          : ready
            ? `Pay ${state.checkout.total.total.amount}`
            : "Loading secure payment…"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Payments are processed securely by Stripe. We never see or store your card details.
      </p>
    </div>
  );
}
