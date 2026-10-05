"use client";

import { useEffect, useRef, useState } from "react";
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
 * One Stripe Checkout Session (`ui_mode: "elements"`) shared by every Stripe
 * element inside it (card fields + Place Order, wallet buttons). Re-keyed by
 * the caller whenever the session is recreated.
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

// ─── One-tap buttons (Express Checkout Element) ────────────────────────────

type ExpressMethods = {
  applePay: "always" | "auto" | "never";
  googlePay: "always" | "auto" | "never";
  paypal: "auto" | "never";
  amazonPay: "auto" | "never";
  klarna: "auto" | "never";
  link: "auto" | "never";
};

const NONE: ExpressMethods = {
  applePay: "never",
  googlePay: "never",
  paypal: "never",
  amazonPay: "never",
  klarna: "never",
  link: "never",
};

/** Customer-step shortcut: every wallet. "always" so Apple/Google Pay show on more browsers. */
export const ALL_WALLETS: ExpressMethods = { ...NONE, applePay: "always", googlePay: "always", paypal: "auto", amazonPay: "auto" };
/** Review step, one wallet each — the button the customer chose at the Payment step. */
export const APPLE_GOOGLE: ExpressMethods = { ...NONE, applePay: "always", googlePay: "always" };
export const PAYPAL_ONLY: ExpressMethods = { ...NONE, paypal: "auto" };
export const AMAZON_ONLY: ExpressMethods = { ...NONE, amazonPay: "auto" };

/**
 * One-tap payment buttons. The provider supplies name, email, phone and
 * address, so no form is needed. Stripe only renders a button over HTTPS on a
 * registered domain when the method works on this device, so `onAvailability`
 * reports what actually rendered (a button row is ~48px; an empty frame ~8px).
 * `locked` puts a click-catching overlay over the buttons (e.g. terms unticked).
 */
export function ExpressCheckout({
  methods,
  onAvailability,
  locked = false,
  onLockedClick,
}: {
  methods: ExpressMethods;
  onAvailability?: (available: boolean) => void;
  locked?: boolean;
  onLockedClick?: () => void;
}) {
  const state = useCheckoutElements();
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      onAvailability?.((areaRef.current?.offsetHeight ?? 0) >= 24);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onAvailability]);

  if (state.type !== "success") return null;
  const { checkout } = state;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div ref={areaRef} className={locked ? "pointer-events-none opacity-50" : undefined}>
          <ExpressCheckoutElement
            options={{
              paymentMethods: methods,
              buttonHeight: 48,
              buttonTheme: undefined,
              buttonType: undefined,
              layout: { maxColumns: 2, overflow: "never" },
              paymentMethodOrder: ["apple_pay", "google_pay", "paypal", "amazon_pay"],
            }}
            onReady={(event) => {
              if (!Object.values(event.availablePaymentMethods ?? {}).some(Boolean)) onAvailability?.(false);
            }}
            onConfirm={async (event) => {
              setError(null);
              const result = await checkout.confirm({ expressCheckoutConfirmEvent: event });
              if (result.type === "error") setError(result.error.message);
            }}
          />
        </div>
        {locked && (
          <button
            type="button"
            onClick={onLockedClick}
            aria-label="Agree to the Terms of Sale first"
            className="absolute inset-0 cursor-pointer"
          />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────

/** Card number / expiry / CVC only (the card session is card-only). */
export function CardFields({ onComplete }: { onComplete: (complete: boolean) => void }) {
  const state = useCheckoutElements();
  if (state.type === "error") return <p className="text-sm text-destructive">{state.error.message}</p>;
  if (state.type !== "success") return <p className="text-sm text-muted-foreground">Loading secure card form…</p>;
  return (
    <PaymentElement
      options={{
        layout: "tabs",
        wallets: { applePay: "never", googlePay: "never", link: "never" },
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
      onChange={(event) => onComplete(event.complete)}
    />
  );
}

export type PayDetails = {
  email: string;
  phone: string;
  shipping: StripeCheckoutContact;
  billing: StripeCheckoutContact;
};

/**
 * "Place Order" for card payments. `prepare` validates and saves our form,
 * returning what to hand to Stripe (or null to stop — it shows its own errors).
 */
export function CardPlaceOrder({
  canPay,
  prepare,
}: {
  canPay: boolean;
  prepare: () => Promise<PayDetails | null>;
}) {
  const state = useCheckoutElements();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    // Hand Stripe what the customer typed, so its form never asks again.
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
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        size="lg"
        variant="cta"
        disabled={!ready || !canPay || confirming}
        onClick={pay}
        className="h-12 w-full gap-1.5 text-base"
      >
        <Lock className="size-4" />
        {confirming ? "Processing payment…" : ready ? `Place Order · ${state.checkout.total.total.amount}` : "Loading…"}
      </Button>
    </div>
  );
}
