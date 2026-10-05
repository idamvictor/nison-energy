"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeCheckoutContact } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
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

export const stripeConfigured = stripePromise != null;

/**
 * Wraps the checkout in one Stripe Checkout Session (`ui_mode: "elements"`),
 * so the express wallet bar at the top and the card form at the bottom share
 * it. Re-keyed by the caller whenever the session is recreated.
 */
export function StripeCheckoutProvider({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  if (!stripePromise) return <>{children}</>;
  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret, elementsOptions: { appearance } }}
    >
      {children}
    </CheckoutElementsProvider>
  );
}

/** UK numbers as Stripe expects them (E.164): "07700 900123" → "+447700900123". */
export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  return digits;
}

/** A Stripe address contact. UK addresses have no state, but Stripe rejects an
 *  empty one, so the town (closest UK equivalent) is used. */
export function toStripeContact(name: string, line1: string, city: string, postcode: string): StripeCheckoutContact {
  return {
    name,
    address: { country: "GB", line1: line1.trim(), line2: "", city: city.trim(), postal_code: postcode.trim(), state: city.trim() },
  };
}

/**
 * Apple Pay / Google Pay / PayPal buttons. The wallet supplies the name,
 * email, phone and delivery address, so the customer needn't fill the form.
 * Nothing is hard-coded to show: Stripe offers whatever is switched on in the
 * Dashboard; only the methods we keep as tabs below are turned off here.
 */
export function ExpressCheckout({
  termsAccepted,
  onNeedTerms,
}: {
  termsAccepted: boolean;
  onNeedTerms: () => void;
}) {
  const state = useCheckoutElements();
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.type !== "success") return null;
  const { checkout } = state;

  return (
    <div className={available ? "flex flex-col gap-3" : "hidden"}>
      {/* Checkout-session express buttons have no click hook, so until the
          Terms of Sale are ticked an overlay catches the click and nudges
          instead of letting the wallet open. */}
      <div className="relative">
        <div className={termsAccepted ? undefined : "pointer-events-none opacity-50"}>
          <ExpressCheckoutElement
            options={{
              paymentMethods: { klarna: "never", amazonPay: "never", link: "never" },
              buttonHeight: 48,
              buttonTheme: undefined,
              buttonType: undefined,
              layout: { maxColumns: 3, overflow: "never" },
              paymentMethodOrder: ["apple_pay", "google_pay", "paypal"],
            }}
            onReady={(event) =>
              setAvailable(Object.values(event.availablePaymentMethods ?? {}).some(Boolean))
            }
            onConfirm={async (event) => {
              setError(null);
              const result = await checkout.confirm({ expressCheckoutConfirmEvent: event });
              if (result.type === "error") setError(result.error.message);
            }}
          />
        </div>
        {!termsAccepted && (
          <button
            type="button"
            onClick={onNeedTerms}
            aria-label="Agree to the Terms of Sale to use express checkout"
            className="absolute inset-0 cursor-pointer"
          />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or pay with your details below
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

export type PayDetails = {
  email: string;
  phone: string;
  shipping: StripeCheckoutContact;
  billing: StripeCheckoutContact;
};

/**
 * The card form (and Klarna / Amazon Pay / PayPal tabs) plus the Pay button.
 * `prepare` validates and saves our form, returning what to hand to Stripe —
 * or null to stop (it shows its own errors).
 */
export function PaymentSection({
  canPay,
  prepare,
}: {
  canPay: boolean;
  prepare: () => Promise<PayDetails | null>;
}) {
  const state = useCheckoutElements();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stays false until the Payment Element reports every required field filled.
  const [methodComplete, setMethodComplete] = useState(false);

  if (state.type === "error") {
    return <p className="text-sm text-destructive">{state.error.message}</p>;
  }
  const ready = state.type === "success";

  async function pay() {
    if (state.type !== "success") return;
    setError(null);
    setConfirming(true);
    const fail = (message: string) => {
      setError(message);
      setConfirming(false);
    };
    const details = await prepare();
    if (!details) return setConfirming(false);
    const { checkout } = state;
    // Hand Stripe what the customer typed above, so its form never asks again.
    const steps = [
      () => checkout.updateEmail(details.email),
      () => checkout.updatePhoneNumber(toE164(details.phone)),
      () => checkout.updateShippingAddress(details.shipping),
      () => checkout.updateBillingAddress(details.billing),
    ];
    for (const step of steps) {
      const result = await step();
      if (result.type === "error") {
        return fail((result.error as { message?: string } | undefined)?.message ?? "Please check your details.");
      }
    }
    const result = await checkout.confirm();
    // On success the browser is already redirecting to /checkout/success.
    if (result.type === "error") fail(result.error.message);
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: "tabs",
          // No Link "save my information" box: it can't take our phone number.
          wallets: { link: "never" },
          // Our form supplies name, email, phone and billing address — Stripe
          // refuses to confirm if the Payment Element could collect them again.
          // line2 and state stay "auto" (a "never" field with no value is rejected).
          fields: {
            billingDetails: {
              name: "never",
              email: "never",
              phone: "never",
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
        onChange={(event) => setMethodComplete(event.complete)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        size="lg"
        variant="cta"
        disabled={!ready || !methodComplete || !canPay || confirming}
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
